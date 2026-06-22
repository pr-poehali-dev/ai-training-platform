import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
}

TASKS = {'classification', 'regression', 'text', 'image'}


def esc(v):
    return str(v).replace("'", "''")


def row_to_model(r):
    return {
        'id': r[0], 'name': r[1], 'task': r[2], 'baseModel': r[3], 'epochs': r[4],
        'datasetUrl': r[5], 'status': r[6], 'progress': r[7], 'notebookUrl': r[8],
        'createdAt': str(r[9]),
    }


SELECT_COLS = 'id, name, task, base_model, epochs, dataset_url, status, progress, notebook_url, created_at'


def handler(event: dict, context) -> dict:
    '''REST API для управления обученными ИИ-моделями: список, создание, обновление прогресса и удаление.'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()
    params = event.get('queryStringParameters') or {}

    if method == 'GET':
        cur.execute(f'SELECT {SELECT_COLS} FROM models ORDER BY created_at DESC LIMIT 100')
        items = [row_to_model(r) for r in cur.fetchall()]
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'models': items})}

    if method == 'POST':
        b = json.loads(event.get('body') or '{}')
        name = (b.get('name') or 'model').strip()
        task = b.get('task', 'classification')
        if task not in TASKS:
            task = 'classification'
        base_model = b.get('baseModel', 'RandomForest')
        epochs = int(b.get('epochs', 5))
        dataset_url = b.get('datasetUrl', '')
        notebook_url = b.get('notebookUrl', '')
        cur.execute(
            f"INSERT INTO models (name, task, base_model, epochs, dataset_url, status, progress, notebook_url) "
            f"VALUES ('{esc(name)}', '{esc(task)}', '{esc(base_model)}', {epochs}, '{esc(dataset_url)}', 'created', 0, '{esc(notebook_url)}') "
            f"RETURNING {SELECT_COLS}"
        )
        m = row_to_model(cur.fetchone())
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(m)}

    if method == 'PUT':
        b = json.loads(event.get('body') or '{}')
        model_id = int(b.get('id') or params.get('id') or 0)
        if not model_id:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        sets = []
        if 'status' in b:
            sets.append(f"status = '{esc(b['status'])}'")
        if 'progress' in b:
            sets.append(f"progress = {int(b['progress'])}")
        if not sets:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'nothing to update'})}
        cur.execute(f"UPDATE models SET {', '.join(sets)} WHERE id = {model_id} RETURNING {SELECT_COLS}")
        row = cur.fetchone()
        cur.close(); conn.close()
        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not found'})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(row_to_model(row))}

    if method == 'DELETE':
        model_id = int(params.get('id') or 0)
        if not model_id:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        cur.execute(f'DELETE FROM models WHERE id = {model_id}')
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'deleted': model_id})}

    cur.close(); conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}
