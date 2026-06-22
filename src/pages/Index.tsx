import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { downloadNotebook, taskLabels, type ColabConfig } from '@/lib/colab';

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

const models = [
  { name: 'SUPPORT-BOT', task: 'Классификация', progress: 100, status: 'ГОТОВА' },
  { name: 'SALES-PREDICT', task: 'Прогноз продаж', progress: 64, status: 'ОБУЧАЕТСЯ' },
  { name: 'IMG-TAGGER', task: 'Разметка фото', progress: 28, status: 'ОБУЧАЕТСЯ' },
];

const Index = () => {
  const [dragging, setDragging] = useState(false);
  const [cfg, setCfg] = useState<ColabConfig>({
    modelName: 'MY-FIRST-MODEL',
    task: 'classification',
    baseModel: 'RandomForest',
    epochs: 5,
    datasetUrl: '',
  });

  const setTask = (task: ColabConfig['task']) =>
    setCfg((c) => ({ ...c, task, baseModel: baseModels[task][0] }));

  const openInColab = () => {
    downloadNotebook(cfg);
    window.open('https://colab.research.google.com/#create=true', '_blank');
  };

  return (
    <div className="scanlines min-h-screen bg-background text-foreground">
      {/* MARQUEE */}
      <div className="overflow-hidden border-b-[3px] border-pixel-white bg-pixel-yellow text-pixel-black">
        <div className="flex w-max animate-marquee whitespace-nowrap py-1.5 font-pixel text-[10px]">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex">
              {'★ ОБУЧАЙ ИИ ★ ЗАГРУЖАЙ ДАТАСЕТ ★ ГЕНЕРИРУЙ COLAB ★ БЕЗ КОДА ★ '.repeat(2)}
            </span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b-[3px] border-pixel-white bg-background">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-pixel-yellow pixel-border-yellow">
              <span className="font-pixel text-pixel-black">P</span>
            </div>
            <span className="font-pixel text-sm">PIXELFORGE</span>
          </div>
          <nav className="hidden items-center gap-6 lg:flex">
            {nav.map((item, i) => (
              <a key={item} href="#" className={`font-mono-pixel text-xl transition-colors hover:text-pixel-yellow ${i === 0 ? 'text-pixel-yellow' : ''}`}>
                {item}
              </a>
            ))}
          </nav>
          <Button className="pixel-btn h-auto rounded-none border-[3px] border-pixel-black bg-pixel-yellow px-4 py-2 font-pixel text-[10px] text-pixel-black hover:bg-pixel-yellow">
            СТАРТ
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="checker-bg border-b-[3px] border-pixel-white">
        <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-in">
            <div className="mb-6 inline-block border-[3px] border-pixel-white bg-secondary px-3 py-1.5 font-pixel text-[9px]">
              ▸ NO-CODE AI TRAINER
            </div>
            <h1 className="font-pixel text-3xl leading-[1.5] md:text-4xl md:leading-[1.5]">
              ОБУЧАЙ <span className="bg-pixel-yellow px-1 text-pixel-black">ИИ</span><br />
              ПОД СВОИ<br />
              ЗАДАЧИ
            </h1>
            <p className="mt-6 max-w-md font-mono-pixel text-2xl leading-tight text-muted-foreground">
              Загрузи данные — платформа сама соберёт ноутбук и настроит Google Colab. Просто нажми RUN.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#train">
                <Button className="pixel-btn h-auto rounded-none border-[3px] border-pixel-black bg-pixel-yellow px-7 py-3 font-pixel text-xs text-pixel-black hover:bg-pixel-yellow">
                  ▶ СОЗДАТЬ МОДЕЛЬ
                </Button>
              </a>
              <Button className="pixel-btn h-auto rounded-none border-[3px] border-pixel-white bg-background px-7 py-3 font-pixel text-xs text-pixel-white hover:bg-secondary">
                ДЕМО
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3">
              {[['50K+', 'МОДЕЛЕЙ'], ['12 МИН', 'ОБУЧЕНИЕ'], ['100%', 'NO-CODE']].map(([n, l]) => (
                <div key={l} className="border-[3px] border-pixel-white bg-card p-3 text-center">
                  <div className="font-pixel text-sm text-pixel-yellow">{n}</div>
                  <div className="mt-1 font-mono-pixel text-base text-muted-foreground">{l}</div>
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
              <div className="space-y-2 p-5 font-mono-pixel text-xl">
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
      <section className="container py-16">
        <h2 className="mb-10 text-center font-pixel text-xl">КАК ЭТО РАБОТАЕТ</h2>
        <div className="grid gap-6 md:grid-cols-3">
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
        <div className="container py-16">
          <h2 className="mb-3 text-center font-pixel text-xl">НАСТРОЙ ОБУЧЕНИЕ</h2>
          <p className="mb-10 text-center font-mono-pixel text-2xl text-muted-foreground">
            Платформа сама соберёт готовый ноутбук для Google Colab
          </p>

          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
            {/* left: form */}
            <div className="space-y-6 border-[3px] border-pixel-white bg-card p-6 pixel-shadow">
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
                <div className="grid grid-cols-2 gap-2">
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

              <div>
                <label className="mb-2 block font-pixel text-[10px]">ССЫЛКА НА ДАТАСЕТ (НЕОБЯЗ.)</label>
                <input
                  value={cfg.datasetUrl}
                  onChange={(e) => setCfg((c) => ({ ...c, datasetUrl: e.target.value }))}
                  placeholder="https://.../dataset.csv"
                  className="w-full border-[3px] border-pixel-white bg-background px-3 py-2 font-mono-pixel text-xl outline-none placeholder:text-muted-foreground focus:border-pixel-yellow"
                />
              </div>

              <Button
                onClick={openInColab}
                className="pixel-btn h-auto w-full rounded-none border-[3px] border-pixel-black bg-pixel-yellow py-3 font-pixel text-xs text-pixel-black hover:bg-pixel-yellow"
              >
                ▶ ОТКРЫТЬ В GOOGLE COLAB
              </Button>
            </div>

            {/* right: dropzone + preview */}
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); }}
                className={`flex flex-col items-center justify-center border-[3px] border-dashed p-8 text-center transition-colors ${dragging ? 'border-pixel-yellow bg-pixel-yellow/10' : 'border-pixel-white bg-card'}`}
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center border-[3px] border-pixel-white bg-pixel-yellow animate-pixel-bounce">
                  <Icon name="Upload" size={24} className="text-pixel-black" />
                </div>
                <p className="font-pixel text-[10px]">БРОСЬ ДАТАСЕТ СЮДА</p>
                <p className="mt-2 font-mono-pixel text-lg text-muted-foreground">CSV · JSON · ZIP · TXT · до 5 ГБ</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['.csv', '.json', '.zip', '.txt'].map((t) => (
                    <span key={t} className="border-[3px] border-pixel-white px-2 py-0.5 font-mono-pixel text-base">{t}</span>
                  ))}
                </div>
              </div>

              <div className="border-[3px] border-pixel-white bg-card p-5">
                <p className="mb-3 font-pixel text-[10px] text-pixel-yellow">▸ ПРЕВЬЮ НОУТБУКА</p>
                <div className="space-y-1 font-mono-pixel text-lg text-muted-foreground">
                  <p>📓 {cfg.modelName || 'MODEL'}.ipynb</p>
                  <p>├─ install deps</p>
                  <p>├─ load {cfg.datasetUrl ? 'from url' : 'via upload'}</p>
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
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-pixel text-xl">МОИ МОДЕЛИ</h2>
          <a href="#" className="font-mono-pixel text-xl text-pixel-yellow hover:underline">ВСЕ ▸</a>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {models.map((m) => (
            <div key={m.name} className="border-[3px] border-pixel-white bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center border-[3px] border-pixel-white bg-pixel-yellow">
                  <Icon name="Box" size={18} className="text-pixel-black" />
                </div>
                <span className={`border-[3px] px-2 py-0.5 font-pixel text-[8px] ${m.progress === 100 ? 'border-pixel-yellow bg-pixel-yellow text-pixel-black' : 'border-pixel-white'}`}>
                  {m.status}
                </span>
              </div>
              <h3 className="mt-4 font-pixel text-xs">{m.name}</h3>
              <p className="mt-2 font-mono-pixel text-lg text-muted-foreground">{m.task}</p>
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

      {/* CTA */}
      <section className="container py-16">
        <div className="border-[3px] border-pixel-white bg-pixel-yellow p-10 text-center text-pixel-black pixel-shadow md:p-14">
          <h2 className="font-pixel text-xl md:text-2xl">ГОТОВ ОБУЧИТЬ ИИ?</h2>
          <p className="mx-auto mt-4 max-w-xl font-mono-pixel text-2xl">
            Загрузи датасет, получи готовый Colab-ноутбук и запусти обучение в один клик.
          </p>
          <a href="#train">
            <Button className="pixel-btn mt-7 h-auto rounded-none border-[3px] border-pixel-black bg-background px-8 py-3 font-pixel text-xs text-pixel-white hover:bg-card">
              ▶ НАЧАТЬ БЕСПЛАТНО
            </Button>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-[3px] border-pixel-white">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 font-mono-pixel text-lg text-muted-foreground md:flex-row">
          <span className="font-pixel text-[10px] text-pixel-white">PIXELFORGE</span>
          <span>© 2026 — ОБУЧАЙ ИИ В ПИКСЕЛЯХ</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
