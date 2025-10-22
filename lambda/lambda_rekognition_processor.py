import json
import os
import boto3
from io import BytesIO
from PIL import Image, ImageDraw
from datetime import datetime

s3 = boto3.client("s3")
rekognition = boto3.client("rekognition")
dynamodb = boto3.resource("dynamodb")

TABLE_NAME = os.environ.get('TABLE_NAME')

def lambda_handler(event, context):
    """
    Lambda function để xử lý job phân tích ảnh từ SQS
    """
    try:
        # Parse message from SQS
        for record in event["Records"]:
            message = json.loads(record["body"])

            job_id = message["job_id"]
            s3_key = message["s3_key"]
            bucket = message["bucket"]
            max_labels = message["max_labels"]
            min_confidence = message["min_confidence"]

            print(f"Processing job {job_id}...")

            # Update status to PROCESSING
            update_job_status(job_id, 'PROCESSING')

            # Call Rekognition API
            response = rekognition.detect_labels(
                Image={
                    'S3Object': {
                        'Bucket': bucket,
                        'Name': s3_key,
                    },
                },
                MaxLabels=max_labels,
                MinConfidence=min_confidence,
            )
            
            # Parse labels
            labels = []
            for label_data in response["Labels"]:
                if label_data.get("Instances"):
                    for instance in label_data["Instances"]:
                        if instance.get("BoundingBox"):
                            labels.append({
                                'name': label_data["Name"],
                                'confidence': label_data["Confidence"],
                                'bounding_box': instance["BoundingBox"],
                            })
            
            # Tải ảnh từ S3
            img_obj = s3.get_object(Bucket=bucket, Key=s3_key)
            img_bytes = img_obj["Body"].read()
            img = Image.open(BytesIO(img_bytes))

            # Vẽ bounding boxes lên ảnh
            img_with_boxes = draw_bounding_boxes(img, labels)

            # Upload ảnh với bounding boxes lên S3
            new_s3_key = f"processed/{job_id}.jpg"
            buffer = BytesIO()
            img_with_boxes.save(buffer, format='JPEG')
            buffer.seek(0)

            s3.put_object(
                Bucket=bucket,
                Key=new_s3_key,
                Body=buffer,
                ContentType='image/jpeg',
            )

            # Update job status to COMPLETED
            table = dynamodb.Table(TABLE_NAME)
            table.update_item(
                Key={'job_id': job_id},
                UpdateExpression='SET #status = :status, processed_s3_key = :key, completed_at = :time',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': 'COMPLETED', ':key': new_s3_key, ':time': datetime.now().isoformat()},
            )

            print(f"Job {job_id} completed successfully.")

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Processing completed successfully.'
            })
        }
    
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")

        if 'job_id' in locals():
            update_job_status(job_id, 'FAILED', str(e))
        raise

def draw_bounding_boxes(image, labels):
    """Vẽ bounding boxes lên ảnh"""
    draw = ImageDraw.Draw(image)
    img_width, img_height = image.size
    
    # Để tránh trùng lặp bounding box
    drawn_boxes = set()
    
    for label in labels:
        bbox = label['bounding_box']
        bbox_key = (
            round(bbox['Left'], 2),
            round(bbox['Top'], 2),
            round(bbox['Width'], 2),
            round(bbox['Height'], 2)
        )
        
        if bbox_key in drawn_boxes:
            continue
        drawn_boxes.add(bbox_key)
        
        # Chuyển đổi từ tỷ lệ sang pixel
        left = bbox['Left'] * img_width
        top = bbox['Top'] * img_height
        width = bbox['Width'] * img_width
        height = bbox['Height'] * img_height
        
        # Vẽ rectangle
        draw.rectangle(
            [left, top, left + width, top + height],
            outline='red',
            width=3
        )
        
        # Vẽ nhãn
        text = f"{label['name']} ({label['confidence']:.1f}%)"
        draw.text(
            (left, max(0, top - 15)),
            text,
            fill='white'
        )
    
    return image

def update_job_status(job_id, status, error=None):
    """Update job status trong DynamoDB"""
    table = dynamodb.Table(TABLE_NAME)
    update_expr = 'SET #status = :status'
    expr_values = {':status': status}
    expr_names = {'#status': 'status'}
    
    if error:
        update_expr += ', error_message = :error'
        expr_values[':error'] = error
    
    table.update_item(
        Key={'job_id': job_id},
        UpdateExpression=update_expr,
        ExpressionAttributeNames=expr_names,
        ExpressionAttributeValues=expr_values
    )