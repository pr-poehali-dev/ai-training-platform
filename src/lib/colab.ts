export interface ColabConfig {
  modelName: string;
  task: 'classification' | 'regression' | 'text' | 'image';
  baseModel: string;
  epochs: number;
  datasetUrl: string;
}

const taskLabels: Record<ColabConfig['task'], string> = {
  classification: 'Классификация',
  regression: 'Регрессия / прогноз',
  text: 'Обработка текста (NLP)',
  image: 'Распознавание изображений',
};

function md(lines: string[]) {
  return { cell_type: 'markdown', metadata: {}, source: lines };
}

function code(lines: string[]) {
  return { cell_type: 'code', metadata: {}, execution_count: null, outputs: [], source: lines };
}

function buildTrainingCode(cfg: ColabConfig): string[] {
  if (cfg.task === 'text') {
    return [
      `from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer\n`,
      `tokenizer = AutoTokenizer.from_pretrained("${cfg.baseModel}")\n`,
      `model = AutoModelForSequenceClassification.from_pretrained("${cfg.baseModel}", num_labels=2)\n`,
      `\n`,
      `args = TrainingArguments(output_dir="out", num_train_epochs=${cfg.epochs}, per_device_train_batch_size=16)\n`,
      `# trainer = Trainer(model=model, args=args, train_dataset=ds)\n`,
      `# trainer.train()\n`,
    ];
  }
  if (cfg.task === 'image') {
    return [
      `import tensorflow as tf\n`,
      `base = tf.keras.applications.MobileNetV2(include_top=False, weights="imagenet", input_shape=(224,224,3))\n`,
      `base.trainable = False\n`,
      `model = tf.keras.Sequential([base, tf.keras.layers.GlobalAveragePooling2D(), tf.keras.layers.Dense(10, activation="softmax")])\n`,
      `model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])\n`,
      `# model.fit(train_ds, epochs=${cfg.epochs})\n`,
    ];
  }
  // tabular: classification / regression
  const estimator = cfg.task === 'regression'
    ? 'from sklearn.ensemble import RandomForestRegressor as Model'
    : 'from sklearn.ensemble import RandomForestClassifier as Model';
  return [
    `import pandas as pd\n`,
    `from sklearn.model_selection import train_test_split\n`,
    `${estimator}\n`,
    `\n`,
    `df = pd.read_csv("dataset.csv")\n`,
    `X = df.drop(columns=[df.columns[-1]])\n`,
    `y = df[df.columns[-1]]\n`,
    `X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)\n`,
    `\n`,
    `model = Model(n_estimators=${cfg.epochs * 20})\n`,
    `model.fit(X_tr, y_tr)\n`,
    `print("Точность:", model.score(X_te, y_te))\n`,
  ];
}

export function buildNotebook(cfg: ColabConfig) {
  const cells = [
    md([
      `# ${cfg.modelName}\n`,
      `**Задача:** ${taskLabels[cfg.task]}  \n`,
      `**Базовая модель:** \`${cfg.baseModel}\`  \n`,
      `**Эпох:** ${cfg.epochs}\n`,
      `\n`,
      `> Ноутбук сгенерирован автоматически платформой PixelForge.`,
    ]),
    md([`## 1. Установка зависимостей`]),
    code([
      `!pip -q install pandas scikit-learn transformers tensorflow datasets\n`,
    ]),
    md([`## 2. Загрузка датасета`]),
    code([
      cfg.datasetUrl
        ? `!wget -q -O dataset.csv "${cfg.datasetUrl}"\n`
        : `from google.colab import files\nuploaded = files.upload()  # выбери свой датасет\n`,
    ]),
    md([`## 3. Обучение модели`]),
    code(buildTrainingCode(cfg)),
    md([`## 4. Сохранение результата`]),
    code([
      `import joblib\n`,
      `try:\n`,
      `    joblib.dump(model, "${cfg.modelName.replace(/\s+/g, '_')}.pkl")\n`,
      `    print("Модель сохранена!")\n`,
      `except Exception as e:\n`,
      `    print("Сохрани модель вручную:", e)\n`,
    ]),
  ];

  return {
    nbformat: 4,
    nbformat_minor: 0,
    metadata: {
      colab: { provenance: [], toc_visible: true },
      kernelspec: { name: 'python3', display_name: 'Python 3' },
      language_info: { name: 'python' },
    },
    cells,
  };
}

export function downloadNotebook(cfg: ColabConfig) {
  const nb = buildNotebook(cfg);
  const blob = new Blob([JSON.stringify(nb, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cfg.modelName.replace(/\s+/g, '_') || 'model'}.ipynb`;
  a.click();
  URL.revokeObjectURL(url);
}

export { taskLabels };
