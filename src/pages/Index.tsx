import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const HERO_IMG = 'https://cdn.poehali.dev/projects/cd4c8b07-74fc-47a0-8cb1-62a0905095d1/files/28f2e8aa-0126-48e9-86e5-ac99b59f6cc0.jpg';

const nav = ['Главная', 'Обучение', 'Мои модели', 'Документация', 'Профиль'];

const steps = [
  { icon: 'Upload', title: 'Загрузи датасет', desc: 'CSV, JSON, изображения или текст — перетащи файлы и платформа всё подготовит сама.' },
  { icon: 'Settings2', title: 'Настрой обучение', desc: 'Выбери базовую модель, задай параметры или доверь автонастройку нейросети.' },
  { icon: 'Rocket', title: 'Запусти и используй', desc: 'Тренируй в один клик и получай готовую модель под свою задачу через API.' },
];

const models = [
  { name: 'Support Bot v2', task: 'Классификация запросов', progress: 100, status: 'Готова', color: 'cyan' },
  { name: 'Sales Forecast', task: 'Прогноз продаж', progress: 64, status: 'Обучается', color: 'purple' },
  { name: 'Image Tagger', task: 'Разметка изображений', progress: 28, status: 'Обучается', color: 'pink' },
];

const colorMap: Record<string, string> = {
  cyan: 'from-neon-cyan to-neon-purple',
  purple: 'from-neon-purple to-neon-pink',
  pink: 'from-neon-pink to-neon-purple',
};

const Index = () => {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* glow blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[10%] h-[500px] w-[500px] rounded-full bg-neon-purple/20 blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-[5%] right-[5%] h-[450px] w-[450px] rounded-full bg-neon-cyan/15 blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-40" />

      {/* NAV */}
      <header className="sticky top-0 z-50 glass">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan glow-purple">
              <Icon name="BrainCircuit" size={20} className="text-background" />
            </div>
            <span className="font-display text-xl font-bold">NeuroForge</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((item, i) => (
              <a key={item} href="#" className={`text-sm transition-colors hover:text-neon-cyan ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                {item}
              </a>
            ))}
          </nav>
          <Button className="rounded-full bg-gradient-to-r from-neon-purple to-neon-pink font-medium text-background hover:opacity-90">
            Начать
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="container relative grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <div className="animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-mono text-neon-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse-glow" />
            no-code обучение нейросетей
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Обучай <span className="text-gradient">ИИ</span> под свои<br />задачи за минуты
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Загружай датасеты, тренируй собственные модели и внедряй их в продукт — без строчки кода.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" className="rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan px-8 font-semibold text-background hover:opacity-90 glow-purple">
              <Icon name="Sparkles" size={18} className="mr-2" />
              Создать модель
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-border bg-transparent px-8 hover:bg-secondary">
              Посмотреть демо
            </Button>
          </div>
          <div className="mt-10 flex gap-8">
            {[['50K+', 'обученных моделей'], ['12 мин', 'среднее обучение'], ['99.2%', 'аптайм API']].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-2xl font-bold text-gradient">{n}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-scale-in">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-neon-purple/30 to-neon-cyan/30 blur-2xl" />
          <img
            src={HERO_IMG}
            alt="Нейросеть"
            className="relative w-full rounded-3xl border border-border animate-float"
          />
        </div>
      </section>

      {/* DATASET UPLOAD */}
      <section className="container py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Загрузи датасет для обучения</h2>
            <p className="mt-3 text-muted-foreground">Перетащи файлы или выбери с устройства — мы поддерживаем CSV, JSON, ZIP с изображениями и текст.</p>
          </div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); }}
            className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-14 text-center transition-all ${dragging ? 'border-neon-cyan bg-neon-cyan/5 glow-cyan' : 'border-border bg-card/40'}`}
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan glow-purple">
              <Icon name="CloudUpload" size={30} className="text-background" />
            </div>
            <p className="font-display text-lg font-semibold">Перетащи файлы сюда</p>
            <p className="mt-1 text-sm text-muted-foreground">или нажми кнопку ниже — до 5 ГБ на датасет</p>
            <Button className="mt-6 rounded-full bg-secondary font-medium hover:bg-muted">
              <Icon name="FolderOpen" size={18} className="mr-2" />
              Выбрать файлы
            </Button>
            <div className="mt-7 flex flex-wrap justify-center gap-2 font-mono text-xs text-muted-foreground">
              {['.csv', '.json', '.zip', '.txt', '.parquet'].map((t) => (
                <span key={t} className="rounded-full border border-border px-3 py-1">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-16">
        <h2 className="mb-12 text-center font-display text-3xl font-bold md:text-4xl">Три шага до своей модели</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="group relative rounded-3xl border border-border bg-card/40 p-8 transition-all hover:border-neon-purple/60 hover:-translate-y-1">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary transition-colors group-hover:bg-neon-purple/20">
                <Icon name={s.icon} size={26} className="text-neon-cyan" />
              </div>
              <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
              <h3 className="mt-2 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MY MODELS */}
      <section className="container py-16">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Мои модели</h2>
          <a href="#" className="text-sm text-neon-cyan hover:underline">Все модели →</a>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {models.map((m) => (
            <div key={m.name} className="rounded-3xl border border-border bg-card/40 p-6 transition-all hover:border-neon-cyan/50">
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[m.color]}`}>
                  <Icon name="Box" size={20} className="text-background" />
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${m.progress === 100 ? 'bg-neon-cyan/15 text-neon-cyan' : 'bg-neon-purple/15 text-neon-purple'}`}>
                  {m.status}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.task}</p>
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs font-mono text-muted-foreground">
                  <span>прогресс</span>
                  <span>{m.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full rounded-full bg-gradient-to-r ${colorMap[m.color]}`} style={{ width: `${m.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-neon-purple/15 via-card to-neon-cyan/10 p-12 text-center md:p-16">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold md:text-5xl">Готов обучить свой ИИ?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Создай первую модель бесплатно. Без кода, без сложных настроек — просто загрузи данные и нажми «Запустить».</p>
            <Button size="lg" className="mt-8 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan px-10 font-semibold text-background hover:opacity-90 glow-purple">
              <Icon name="Sparkles" size={18} className="mr-2" />
              Начать бесплатно
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Icon name="BrainCircuit" size={18} className="text-neon-purple" />
            <span className="font-display font-semibold text-foreground">NeuroForge</span>
          </div>
          <span>© 2026 NeuroForge — платформа обучения ИИ</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
