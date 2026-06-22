import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
}

TASKS = {'classification', 'regression', 'text', 'image'}

TOOLS = [
    {
        'name': 'create_model',
        'description': 'Создать новую ИИ-модель для обучения под задачу пользователя.',
        'inputSchema': {
            'type': 'object',
            'properties': {
                'name': {'type': 'string', 'description': 'Имя модели'},
                'task': {'type': 'string', 'enum': list(TASKS), 'description': 'Тип задачи'},
                'baseModel': {'type': 'string', 'description': 'Базовая модель'},
                'epochs': {'type': 'integer', 'description': 'Количество эпох'},
                'datasetUrl': {'type': 'string', 'description': 'Ссылка на датасет (опционально)'},
            },
            'required': ['name', 'task'],
        },
    },
    {
        'name': 'list_models',
        'description': 'Получить список всех созданных моделей и их статус обучения.',
        'inputSchema': {'type': 'object', 'properties': {}},
    },
    {
        'name': 'generate_notebook',
        'description': 'Сгенерировать код Google Colab ноутбука (.ipynb JSON) для обучения модели.',
        'inputSchema': {
            'type': 'object',
            'properties': {
                'name': {'type': 'string'},
                'task': {'type': 'string', 'enum': list(TASKS)},
                'baseModel': {'type': 'string'},
                'epochs': {'type': 'integer'},
                'datasetUrl': {'type': 'string'},
            },
            'required': ['name', 'task', 'baseModel'],
        },
    },
]


def esc(v):
    return str(v).replace("'", "''")


def db():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    return conn


def build_notebook(args):
    name = args.get('name', 'model')
    task = args.get('task', 'classification')
    base = args.get('baseModel', 'RandomForest')
    epochs = int(args.get('epochs', 5))
    url = args.get('datasetUrl', '')

    if task == 'text':
        train = [
            'from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments\n',
            f'tokenizer = AutoTokenizer.from_pretrained("{base}")\n',
            f'model = AutoModelForSequenceClassification.from_pretrained("{base}", num_labels=2)\n',
            f'args = TrainingArguments(output_dir="out", num_train_epochs={epochs}, per_device_train_batch_size=16)\n',
        ]
    elif task == 'image':
        train = [
            'import tensorflow as tf\n',
            f'base = tf.keras.applications.{base}(include_top=False, weights="imagenet", input_shape=(224,224,3))\n',
            'base.trainable = False\n',
            'model = tf.keras.Sequential([base, tf.keras.layers.GlobalAveragePooling2D(), tf.keras.layers.Dense(10, activation="softmax")])\n',
            'model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])\n',
        ]
    else:
        est = 'RandomForestRegressor' if task == 'regression' else 'RandomForestClassifier'
        train = [
            'import pandas as pd\n',
            'from sklearn.model_selection import train_test_split\n',
            f'from sklearn.ensemble import {est} as Model\n',
            'df = pd.read_csv("dataset.csv")\n',
            'X = df.drop(columns=[df.columns[-1]]); y = df[df.columns[-1]]\n',
            'X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)\n',
            f'model = Model(n_estimators={epochs * 20}); model.fit(X_tr, y_tr)\n',
            'print("Точность:", model.score(X_te, y_te))\n',
        ]

    load = [f'!wget -q -O dataset.csv "{url}"\n'] if url else ['from google.colab import files\nuploaded = files.upload()\n']

    def code(src):
        return {'cell_type': 'code', 'metadata': {}, 'execution_count': None, 'outputs': [], 'source': src}

    def md(src):
        return {'cell_type': 'markdown', 'metadata': {}, 'source': src}

    return {
        'nbformat': 4, 'nbformat_minor': 0,
        'metadata': {'colab': {'provenance': []}, 'kernelspec': {'name': 'python3', 'display_name': 'Python 3'}},
        'cells': [
            md([f'# {name}\n', f'Задача: {task} | Модель: {base} | Эпох: {epochs}']),
            md(['## Установка']),
            code(['!pip -q install pandas scikit-learn transformers tensorflow datasets\n']),
            md(['## Загрузка данных']),
            code(load),
            md(['## Обучение']),
            code(train),
        ],
    }


def call_tool(tool, args):
    if tool == 'list_models':
        conn = db(); cur = conn.cursor()
        cur.execute('SELECT id, name, task, status, progress FROM models ORDER BY created_at DESC LIMIT 50')
        rows = cur.fetchall(); cur.close(); conn.close()
        models = [{'id': r[0], 'name': r[1], 'task': r[2], 'status': r[3], 'progress': r[4]} for r in rows]
        return {'content': [{'type': 'text', 'text': json.dumps(models, ensure_ascii=False)}]}

    if tool == 'create_model':
        name = args.get('name', 'model')
        task = args.get('task', 'classification')
        if task not in TASKS:
            task = 'classification'
        base = args.get('baseModel', 'RandomForest')
        epochs = int(args.get('epochs', 5))
        url = args.get('datasetUrl', '')
        conn = db(); cur = conn.cursor()
        cur.execute(
            f"INSERT INTO models (name, task, base_model, epochs, dataset_url, status) "
            f"VALUES ('{esc(name)}', '{esc(task)}', '{esc(base)}', {epochs}, '{esc(url)}', 'created') RETURNING id"
        )
        mid = cur.fetchone()[0]; cur.close(); conn.close()
        return {'content': [{'type': 'text', 'text': f'Модель "{name}" создана с id={mid}'}]}

    if tool == 'generate_notebook':
        nb = build_notebook(args)
        return {'content': [{'type': 'text', 'text': json.dumps(nb, ensure_ascii=False)}]}

    raise ValueError(f'unknown tool: {tool}')


def handler(event: dict, context) -> dict:
    '''MCP-сервер (JSON-RPC 2.0): подключение ИИ-ассистентов для создания моделей и генерации Colab-ноутбуков.'''
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    if method == 'GET':
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
            'name': 'pixelforge-mcp', 'version': '1.0.0', 'protocol': 'mcp',
            'tools': [t['name'] for t in TOOLS],
        })}

    req = json.loads(event.get('body') or '{}')
    rpc_id = req.get('id')
    rpc_method = req.get('method', '')
    params = req.get('params') or {}

    def ok(result):
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'jsonrpc': '2.0', 'id': rpc_id, 'result': result})}

    def err(code, msg):
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'jsonrpc': '2.0', 'id': rpc_id, 'error': {'code': code, 'message': msg}})}

    if rpc_method == 'initialize':
        return ok({
            'protocolVersion': '2024-11-05',
            'capabilities': {'tools': {}},
            'serverInfo': {'name': 'pixelforge-mcp', 'version': '1.0.0'},
        })

    if rpc_method == 'tools/list':
        return ok({'tools': TOOLS})

    if rpc_method == 'tools/call':
        tool = params.get('name', '')
        args = params.get('arguments') or {}
        try:
            return ok(call_tool(tool, args))
        except Exception as e:
            return err(-32603, str(e))

    return err(-32601, f'method not found: {rpc_method}')
