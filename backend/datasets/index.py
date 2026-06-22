import json
import os
import base64
import uuid
import psycopg2
import boto3

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
}


def handler(event: dict, context) -> dict:
    '''Загрузка датасетов в облачное хранилище S3 и сохранение их в базе данных.'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    conn.autocommit = True

    if method == 'GET':
        cur = conn.cursor()
        cur.execute('SELECT id, name, file_url, size_bytes, file_type, created_at FROM datasets ORDER BY created_at DESC LIMIT 50')
        rows = cur.fetchall()
        cur.close()
        conn.close()
        items = [
            {'id': r[0], 'name': r[1], 'fileUrl': r[2], 'sizeBytes': r[3], 'fileType': r[4], 'createdAt': str(r[5])}
            for r in rows
        ]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'datasets': items})}

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = (body.get('name') or 'dataset').strip()
        content_b64 = body.get('content', '')
        file_type = body.get('fileType', 'csv')

        if not content_b64:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'content required'})}

        if ',' in content_b64 and content_b64.strip().startswith('data:'):
            content_b64 = content_b64.split(',', 1)[1]
        data = base64.b64decode(content_b64)

        ak = os.environ['AWS_ACCESS_KEY_ID']
        sk = os.environ['AWS_SECRET_ACCESS_KEY']
        s3 = boto3.client('s3', endpoint_url='https://bucket.poehali.dev', aws_access_key_id=ak, aws_secret_access_key=sk)

        safe = ''.join(c for c in name if c.isalnum() or c in '._-') or 'dataset'
        key = f'datasets/{uuid.uuid4().hex}_{safe}'
        s3.put_object(Bucket='files', Key=key, Body=data, ContentType='application/octet-stream')
        file_url = f'https://cdn.poehali.dev/projects/{ak}/bucket/{key}'

        cur = conn.cursor()
        safe_name = name.replace("'", "''")
        cur.execute(
            f"INSERT INTO datasets (name, file_url, size_bytes, file_type) VALUES ('{safe_name}', '{file_url}', {len(data)}, '{file_type}') RETURNING id, created_at"
        )
        row = cur.fetchone()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({'id': row[0], 'name': name, 'fileUrl': file_url, 'sizeBytes': len(data), 'createdAt': str(row[1])}),
        }

    conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}
