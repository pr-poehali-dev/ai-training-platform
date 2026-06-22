import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import { downloadNotebook, taskLabels, type ColabConfig } from '@/lib/colab';
import { API, uploadDataset, listModels, createModel, type ModelRow } from '@/lib/api';

const nav = ['Главная', 'Обучение', 'Мои модели', 'Документация', 'Профиль'];

const baseModels: Record<ColabConfig['task'], string[]> = {
  classification: ['RandomForest', 'XGBoost', 'LogReg'],
  regression: ['RandomForest', 'GradientBoost', 'LinearReg'],
  text: ['bert-base-multilingual-cased', 'distilbert-base-uncased', 'cointegrated/rubert-tiny2'],
  image: ['MobileNetV2', 'ResNet50', 'EfficientNetB0'],
};

const steps = [
  { icon: 'Database', t: 'ЗАГРУЗИ', d: 'Брось датасет — CSV, текст или картинки.' },
  { icon: 'Cpu', t: 'НАСТРОЙ', d: 'Платформа сама соберёт код обучения.' },
  { icon: 'Rocket', t: 'ОБУЧИ', d: 'Открой в Google Colab и жми RUN.' },
];

const fallbackModels: ModelRow[] = [
  { id: -1, name: 'SUPPORT-BOT', task: 'classification', baseModel: '-', epochs: 5, datasetUrl: '', status: 'ГОТОВА', progress: 100, notebookUrl: '', createdAt: '' },
  { id: -2, name: 'SALES-PREDICT', task: 'regression', baseModel: '-', epochs: 5, datasetUrl: '', status: 'ОБУЧАЕТСЯ', progress: 64, notebookUrl: '', createdAt: '' },
  { id: -3, name: 'IMG-TAGGER', task: 'image', baseModel: '-', epochs: 5, datasetUrl: '', status: 'ОБУЧАЕТСЯ', progress: 28, notebookUrl: '', createdAt: '' },
];

const Index = () => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [models, setModels] = useState<ModelRow[]>(fallbackModels);
  const fileRef = useRef<HTMLInputElement>(null);

  const [cfg, setCfg] = useState<ColabConfig>({
    modelName: 'MY-FIRST-MODEL',
    task: 'classification',
    baseModel: 'RandomForest',
    epochs: 5,
    datasetUrl: '',
  });

  const refresh = async () => {
    try {
      const list = await listModels();
      if (list.length) setModels(list);
    } catch { /* keep fallback */ }
  };

  useEffect(() => { refresh(); }, []);

  const setTask = (task: ColabConfig['task']) =>
    setCfg((c) => ({ ...c, task, baseModel: baseModels[task][0] }));

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const ds = await uploadDataset(file);
      setCfg((c) => ({ ...c, datasetUrl: ds.fileUrl }));
      setDatasetName(file.name);
      toast({ title: 'Датасет загружен!', description: 'Ссылка добавлена в ноутбук автоматически.' });
    } catch {
      toast({ title: 'Ошибка загрузки', description: 'Попробуй файл поменьше или другой формат.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const openInColab = async () => {
    setBusy(true);
    try {
      downloadNotebook(cfg);
      await createModel({
        name: cfg.modelName, task: cfg.task, baseModel: cfg.baseModel,
        epochs: cfg.epochs, datasetUrl: cfg.datasetUrl,
      });
      await refresh();
      toast({ title: 'Ноутбук готов!', description: 'Файл скачан. Открываю Google Colab.' });
    } catch { /* still open colab */ }
    window.open('https://colab.research.google.com/#create=true', '_blank');
    setBusy(false);
  };

  return (
    <div className="scanlines min-h-screen bg-background text-foreground">
      {/* MARQUEE */}
      <div className="overflow-hidden border-b-[3px] border-pixel-white bg-pixel-yellow text-pixel-black">
        <div className="flex w-max animate-marquee whitespace-nowrap py-1.5 font-pixel text-[8px] sm:text-[10px]">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex">
              {'★ ОБУЧАЙ ИИ ★ ЗАГРУЖАЙ ДАТАСЕТ ★ ГЕНЕРИРУЙ COLAB ★ API + MCP ★ '.repeat(2)}
            </span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b-[3px] border-pixel-white bg-background">
        <div className="container flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-pixel-yellow pixel-border-yellow sm:h-9 sm:w-9">
              <span className="font-pixel text-xs text-pixel-black sm:text-base">P</span>
            </div>
            <span className="font-pixel text-xs sm:text-sm">PIXELFORGE</span>
          </div>
          <nav className="hidden items-center gap-6 lg:flex">
            {nav.map((item, i) => (
              <a key={item} href="#" className={`font-mono-pixel text-xl transition-colors hover:text-pixel-yellow ${i === 0 ? 'text-pixel-yellow' : ''}`}>
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#train" className="hidden sm:block">
              <Button className="pixel-btn h-auto rounded-none border-[3px] border-pixel-black bg-pixel-yellow px-4 py-2 font-pixel text-[10px] text-pixel-black hover:bg-pixel-yellow">
                СТАРТ
              </Button>
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center border-[3px] border-pixel-white lg:hidden"
              aria-label="Меню"
            >
              <Icon name={menuOpen ? 'X' : 'Menu'} size={18} />
            </button>
          </div>
        </div>
        {/* mobile menu */}
        {menuOpen && (
          <nav className="border-t-[3px] border-pixel-white bg-card lg:hidden">
            <div className="container flex flex-col py-2">
              {nav.map((item) => (
                <a key={item} href="#" onClick={() => setMenuOpen(false)} className="border-b border-border py-2 font-mono-pixel text-xl last:border-0 hover:text-pixel-yellow">
                  {item}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* HERO */}
      <section className="checker-bg border-b-[3px] border-pixel-white">
        <div className="container grid items-center gap-10 py-12 md:grid-cols-2 md:py-24">
          <div className="animate-fade-in">
            <div className="mb-6 inline-block border-[3px] border-pixel-white bg-secondary px-3 py-1.5 font-pixel text-[8px] sm:text-[9px]">
              ▸ NO-CODE AI TRAINER · API · MCP
            </div>
            <h1 className="font-pixel text-2xl leading-[1.5] sm:text-3xl md:text-4xl md:leading-[1.5]">
              ОБУЧАЙ <span className="bg-pixel-yellow px-1 text-pixel-black">ИИ</span><br />
              ПОД СВОИ<br />
              ЗАДАЧИ
            </h1>
            <p className="mt-6 max-w-md font-mono-pixel text-xl leading-tight text-muted-foreground sm:text-2xl">
              Загрузи данные — платформа сама соберёт ноутбук и настроит Google Colab. Просто нажми RUN.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <a href="#train" className="w-full sm:w-auto">
                <Button className="pixel-btn h-auto w-full rounded-none border-[3px] border-pixel-black bg-pixel-yellow px-7 py-3 font-pixel text-[10px] text-pixel-black hover:bg-pixel-yellow sm:w-auto sm:text-xs">
                  ▶ СОЗДАТЬ МОДЕЛЬ
                </Button>
              </a>
              <a href="#api" className="w-full sm:w-auto">
                <Button className="pixel-btn h-auto w-full rounded-none border-[3px] border-pixel-white bg-background px-7 py-3 font-pixel text-[10px] text-pixel-white hover:bg-secondary sm:w-auto sm:text-xs">
                  API + MCP
                </Button>
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-3">
              {[['50K+', 'МОДЕЛЕЙ'], ['12 МИН', 'ОБУЧЕНИЕ'], ['100%', 'NO-CODE']].map(([n, l]) => (
                <div key={l} className="border-[3px] border-pixel-white bg-card p-2 text-center sm:p-3">
                  <div className="font-pixel text-[10px] text-pixel-yellow sm:text-sm">{n}</div>
                  <div className="mt-1 font-mono-pixel text-sm text-muted-foreground sm:text-base">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* pixel art console */}
          <div className="animate-scale-in">
            <div className="border-[3px] border-pixel-white bg-card pixel-shadow">
              <div className="flex items-center justify-between border-b-[3px] border-pixel-white bg-pixel-yellow px-3 py-2">
                <span className="font-pixel text-[8px] text-pixel-black">TRAINING.EXE</span>
                <div className="flex gap-1.5">
                  {['_', '□', '×'].map((s) => (
                    <span key={s} className="font-pixel text-[8px] text-pixel-black">{s}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-2 p-4 font-mono-pixel text-lg sm:p-5 sm:text-xl">
                <p className="text-pixel-yellow">&gt; loading dataset.csv ...</p>
                <p className="text-muted-foreground">&gt; rows: 12 480 | cols: 18</p>
                <p className="text-pixel-yellow">&gt; building colab notebook ...</p>
                <p className="text-pixel-white">&gt; epoch 1/5 [████░░░░] 38%</p>
                <p className="text-pixel-white">&gt; acc: 0.91 | loss: 0.22</p>
                <p className="text-pixel-yellow">
                  &gt; ready to run<span className="animate-blink">_</span>
                </p>
                <div className="grid grid-cols-8 gap-1 pt-3">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square ${(i * 7) % 3 === 0 ? 'bg-pixel-yellow' : (i % 4 === 0 ? 'bg-pixel-white' : 'bg-secondary')}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="container py-12 sm:py-16">
        <h2 className="mb-8 text-center font-pixel text-base sm:mb-10 sm:text-xl">КАК ЭТО РАБОТАЕТ</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.t} className="border-[3px] border-pixel-white bg-card p-6 transition-transform hover:-translate-y-1">
              <div className="mb-4 flex h-14 w-14 items-center justify-center border-[3px] border-pixel-white bg-pixel-yellow">
                <Icon name={s.icon} size={26} className="text-pixel-black" />
              </div>
              <div className="font-pixel text-xs text-muted-foreground">0{i + 1}</div>
              <h3 className="mt-2 font-pixel text-sm text-pixel-yellow">{s.t}</h3>
              <p className="mt-3 font-mono-pixel text-xl leading-tight text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRAINER + COLAB GENERATOR */}
      <section id="train" className="checker-bg border-y-[3px] border-pixel-white">
        <div className="container py-12 sm:py-16">
          <h2 className="mb-3 text-center font-pixel text-base sm:text-xl">НАСТРОЙ ОБУЧЕНИЕ</h2>
          <p className="mb-8 text-center font-mono-pixel text-xl text-muted-foreground sm:mb-10 sm:text-2xl">
            Платформа сама соберёт готовый ноутбук для Google Colab
          </p>

          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
            {/* left: form */}
            <div className="space-y-6 border-[3px] border-pixel-white bg-card p-5 pixel-shadow sm:p-6">
              <div>
                <label className="mb-2 block font-pixel text-[10px]">ИМЯ МОДЕЛИ</label>
                <input
                  value={cfg.modelName}
                  onChange={(e) => setCfg((c) => ({ ...c, modelName: e.target.value.toUpperCase() }))}
                  className="w-full border-[3px] border-pixel-white bg-background px-3 py-2 font-mono-pixel text-xl outline-none focus:border-pixel-yellow"
                />
              </div>

              <div>
                <label className="mb-2 block font-pixel text-[10px]">ТИП ЗАДАЧИ</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(Object.keys(taskLabels) as ColabConfig['task'][]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTask(t)}
                      className={`border-[3px] px-2 py-2 font-mono-pixel text-lg transition-colors ${cfg.task === t ? 'border-pixel-yellow bg-pixel-yellow text-pixel-black' : 'border-pixel-white bg-background hover:bg-secondary'}`}
                    >
                      {taskLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-pixel text-[10px]">БАЗОВАЯ МОДЕЛЬ</label>
                <div className="flex flex-wrap gap-2">
                  {baseModels[cfg.task].map((m) => (
                    <button
                      key={m}
                      onClick={() => setCfg((c) => ({ ...c, baseModel: m }))}
                      className={`border-[3px] px-3 py-1.5 font-mono-pixel text-lg transition-colors ${cfg.baseModel === m ? 'border-pixel-yellow bg-pixel-yellow text-pixel-black' : 'border-pixel-white bg-background hover:bg-secondary'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-pixel text-[10px]">ЭПОХ: {cfg.epochs}</label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={cfg.epochs}
                  onChange={(e) => setCfg((c) => ({ ...c, epochs: +e.target.value }))}
                  className="w-full accent-[hsl(var(--pixel-yellow))]"
                />
              </div>

              <Button
                onClick={openInColab}
                disabled={busy}
                className="pixel-btn h-auto w-full rounded-none border-[3px] border-pixel-black bg-pixel-yellow py-3 font-pixel text-[10px] text-pixel-black hover:bg-pixel-yellow disabled:opacity-60 sm:text-xs"
              >
                {busy ? '... ГЕНЕРАЦИЯ' : '▶ ОТКРЫТЬ В GOOGLE COLAB'}
              </Button>
            </div>

            {/* right: dropzone + preview */}
            <div className="space-y-6">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json,.zip,.txt,.parquet"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
                className={`flex cursor-pointer flex-col items-center justify-center border-[3px] border-dashed p-8 text-center transition-colors ${dragging ? 'border-pixel-yellow bg-pixel-yellow/10' : 'border-pixel-white bg-card'}`}
              >
                <div className={`mb-3 flex h-14 w-14 items-center justify-center border-[3px] border-pixel-white bg-pixel-yellow ${uploading ? 'animate-blink' : 'animate-pixel-bounce'}`}>
                  <Icon name={uploading ? 'Loader' : 'Upload'} size={24} className="text-pixel-black" />
                </div>
                <p className="font-pixel text-[10px]">{uploading ? 'ЗАГРУЖАЮ...' : datasetName ? '✓ ' + datasetName.toUpperCase() : 'БРОСЬ ДАТАСЕТ СЮДА'}</p>
                <p className="mt-2 font-mono-pixel text-lg text-muted-foreground">CSV · JSON · ZIP · TXT · до 5 ГБ</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['.csv', '.json', '.zip', '.txt'].map((t) => (
                    <span key={t} className="border-[3px] border-pixel-white px-2 py-0.5 font-mono-pixel text-base">{t}</span>
                  ))}
                </div>
              </div>

              <div className="border-[3px] border-pixel-white bg-card p-5">
                <p className="mb-3 font-pixel text-[10px] text-pixel-yellow">▸ ПРЕВЬЮ НОУТБУКА</p>
                <div className="space-y-1 break-all font-mono-pixel text-lg text-muted-foreground">
                  <p>📓 {cfg.modelName || 'MODEL'}.ipynb</p>
                  <p>├─ install deps</p>
                  <p>├─ load {cfg.datasetUrl ? 'from cloud (auto)' : 'via upload'}</p>
                  <p>├─ train: {cfg.baseModel}</p>
                  <p>├─ task: {taskLabels[cfg.task]}</p>
                  <p>├─ epochs: {cfg.epochs}</p>
                  <p>└─ save model.pkl</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MY MODELS */}
      <section className="container py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-pixel text-base sm:text-xl">МОИ МОДЕЛИ</h2>
          <button onClick={refresh} className="font-mono-pixel text-xl text-pixel-yellow hover:underline">↻ ОБНОВИТЬ</button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <div key={m.id} className="border-[3px] border-pixel-white bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center border-[3px] border-pixel-white bg-pixel-yellow">
                  <Icon name="Box" size={18} className="text-pixel-black" />
                </div>
                <span className={`border-[3px] px-2 py-0.5 font-pixel text-[8px] ${m.progress === 100 ? 'border-pixel-yellow bg-pixel-yellow text-pixel-black' : 'border-pixel-white'}`}>
                  {m.status === 'created' ? 'СОЗДАНА' : m.status === 'training' ? 'ОБУЧАЕТСЯ' : m.status.toUpperCase()}
                </span>
              </div>
              <h3 className="mt-4 break-all font-pixel text-xs">{m.name}</h3>
              <p className="mt-2 font-mono-pixel text-lg text-muted-foreground">{taskLabels[m.task as ColabConfig['task']] || m.task}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between font-mono-pixel text-base text-muted-foreground">
                  <span>ПРОГРЕСС</span><span>{m.progress}%</span>
                </div>
                <div className="flex gap-1 border-[3px] border-pixel-white p-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`h-3 flex-1 ${i < Math.round(m.progress / 10) ? 'bg-pixel-yellow' : 'bg-secondary'}`} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* API + MCP */}
      <section id="api" className="checker-bg border-y-[3px] border-pixel-white">
        <div className="container py-12 sm:py-16">
          <h2 className="mb-3 text-center font-pixel text-base sm:text-xl">API + MCP SERVER</h2>
          <p className="mb-8 text-center font-mono-pixel text-xl text-muted-foreground sm:mb-10 sm:text-2xl">
            Подключай платформу к своим приложениям и ИИ-ассистентам
          </p>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {/* REST API */}
            <div className="border-[3px] border-pixel-white bg-card p-5 pixel-shadow sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-[3px] border-pixel-white bg-pixel-yellow">
                  <Icon name="Code2" size={18} className="text-pixel-black" />
                </div>
                <h3 className="font-pixel text-xs">REST API</h3>
              </div>
              <div className="space-y-2 break-all font-mono-pixel text-lg text-muted-foreground">
                <p><span className="text-pixel-yellow">GET</span> /datasets — список</p>
                <p><span className="text-pixel-yellow">POST</span> /datasets — загрузить</p>
                <p><span className="text-pixel-yellow">GET</span> /models — список</p>
                <p><span className="text-pixel-yellow">POST</span> /models — создать</p>
                <p><span className="text-pixel-yellow">PUT</span> /models — прогресс</p>
              </div>
              <div className="mt-4 border-[3px] border-pixel-white bg-background p-3 font-mono-pixel text-base text-pixel-white">
                <p className="break-all text-muted-foreground">{API.models}</p>
              </div>
            </div>

            {/* MCP */}
            <div className="border-[3px] border-pixel-white bg-card p-5 pixel-shadow sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-[3px] border-pixel-white bg-pixel-yellow">
                  <Icon name="Plug" size={18} className="text-pixel-black" />
                </div>
                <h3 className="font-pixel text-xs">MCP SERVER</h3>
              </div>
              <p className="mb-3 font-mono-pixel text-lg text-muted-foreground">
                JSON-RPC для Claude и других ИИ. Инструменты:
              </p>
              <div className="space-y-2 font-mono-pixel text-lg">
                <p className="text-pixel-yellow">▸ create_model</p>
                <p className="text-pixel-yellow">▸ list_models</p>
                <p className="text-pixel-yellow">▸ generate_notebook</p>
              </div>
              <div className="mt-4 border-[3px] border-pixel-white bg-background p-3 font-mono-pixel text-base">
                <p className="break-all text-muted-foreground">{API.mcp}</p>
              </div>
              <Button
                onClick={() => { navigator.clipboard.writeText(API.mcp); toast({ title: 'Скопировано!', description: 'Вставь URL в настройки MCP-клиента.' }); }}
                className="pixel-btn mt-4 h-auto w-full rounded-none border-[3px] border-pixel-black bg-pixel-yellow py-2 font-pixel text-[10px] text-pixel-black hover:bg-pixel-yellow"
              >
                КОПИРОВАТЬ MCP URL
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-12 sm:py-16">
        <div className="border-[3px] border-pixel-white bg-pixel-yellow p-8 text-center text-pixel-black pixel-shadow sm:p-14">
          <h2 className="font-pixel text-base sm:text-xl md:text-2xl">ГОТОВ ОБУЧИТЬ ИИ?</h2>
          <p className="mx-auto mt-4 max-w-xl font-mono-pixel text-xl sm:text-2xl">
            Загрузи датасет, получи готовый Colab-ноутбук и запусти обучение в один клик.
          </p>
          <a href="#train">
            <Button className="pixel-btn mt-7 h-auto rounded-none border-[3px] border-pixel-black bg-background px-8 py-3 font-pixel text-[10px] text-pixel-white hover:bg-card sm:text-xs">
              ▶ НАЧАТЬ БЕСПЛАТНО
            </Button>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-[3px] border-pixel-white">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-center font-mono-pixel text-lg text-muted-foreground md:flex-row md:text-left">
          <span className="font-pixel text-[10px] text-pixel-white">PIXELFORGE</span>
          <span>© 2026 — ОБУЧАЙ ИИ В ПИКСЕЛЯХ</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
