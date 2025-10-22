import json
import boto3
import base64
import uuid
import os
from datetime import datetime

s3 = boto3.client("s3")
sqs = boto3.client("sqs")
dynamodb = boto3.resource("dynamodb")

# Lấy từ environment variables
BUCKET_NAME = os.environ.get('BUCKET_NAME')
QUEUE_URL = os.environ.get('QUEUE_URL')
TABLE_NAME = os.environ.get('TABLE_NAME')

def lambda_handler(event, context):
    """
    Lambda function để nhận ảnh từ API Gateway và upload lên S3, sau đó gửi message vào SQS
    """
    try:
        body = json.loads(event["body"]) if isinstance(event["body"], str) else event.get("body", {})

        # Lấy ảnh từ base64
        image_base64 = body.get("image")
        max_labels = body.get("max_labels", 10)
        min_confidence = body.get("min_confidence", 40)

        if not image_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({
                    'error': 'Missing image data'
                })
            }
        
        # Decode base64
        image_data = base64.b64decode(image_base64)

        # Tạo UUID cho job
        job_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()

        # Upload ảnh lên S3
        s3_key = f"uploads/{job_id}.jpg"
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=image_data,
            ContentType='image/jpeg',
        )

        # Lưu thông tin job vào DynamoDB
        table = dynamodb.Table(TABLE_NAME)
        table.put_item(
            Item={
                'job_id': job_id,
                's3_key': s3_key,
                'status': 'PENDING',
                'created_at': timestamp,
                'max_labels': max_labels,
                'min_confidence': min_confidence,
            }
        )

        # Gửi message vào SQS
        sqs.send_message(
            QueueUrl=QUEUE_URL,
            MessageBody=json.dumps({
                'job_id': job_id,
                's3_key': s3_key,
                'bucket': BUCKET_NAME,
                'max_labels': max_labels,
                'min_confidence': min_confidence,
            })
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'job_id': job_id,
                'status': 'PENDING',
                'message': 'Ảnh đã được upload thành công. Tiến hành phân tích...'
            })
        }
        
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'error': str(e)
            })
        }