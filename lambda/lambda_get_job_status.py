import json
import os
import boto3

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

BUCKET_NAME = os.environ.get('BUCKET_NAME')
TABLE_NAME = os.environ.get('TABLE_NAME')

def lambda_handler(event, context):
    """Lambda function để lấy trạng thái của job phân tích ảnh từ SQS"""
    try:
        job_id = event.get('queryStringParameters', {}).get('job_id')

        if not job_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({
                    'error': 'Missing job_id'
                })
            }
        
        table = dynamodb.Table(TABLE_NAME)
        response = table.get_item(Key={'job_id': job_id})

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({
                    'error': 'Job not found'
                })
            }

        item = response['Item']
        result = {
            'job_id': item['job_id'],
            'status': item['status'],
            'created_at': item['created_at'],
        }

        if item['status'] == 'COMPLETED':
            result['completed_at'] = item.get('completed_at')
            result['labels'] = item.get('labels', [])

            # Tạo presigned URL để tải ảnh về
            result['original_image_url'] = s3.generate_presigned_url('get_object', Params={'Bucket': BUCKET_NAME, 'Key': item['s3_key']}, ExpiresIn=3600)

            if item.get('processed_s3_key'):
                result['processed_image_url'] = s3.generate_presigned_url('get_object', Params={'Bucket': BUCKET_NAME, 'Key': item['processed_s3_key']}, ExpiresIn=3600)
        
        elif item['status'] == 'FAILED':
            result['error_message'] = item.get('error_message', 'Unknown error')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps(result)
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