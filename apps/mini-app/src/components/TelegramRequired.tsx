import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "./ui/lamp";
import {
  Search,
  Crosshair,
  Calculator,
  TrendingUp,
  Zap,
  Shield,
  Send,
  Bell,
} from "lucide-react";
import screenshotBrands from "../assets/Screenshot_20260311_102957.jpg";
import screenshotConfig from "../assets/Screenshot_20260311_103037.jpg";
import screenshotEstimation from "../assets/Screenshot_20260311_103044.jpg";
import screenshotResult from "../assets/Screenshot_20260311_103107.jpg";
import screenshotMonitorEmpty from "../assets/Screenshot_20260311_103116.jpg";
import screenshotMonitor from "../assets/Screenshot_20260311_103502.jpg";

const BOT_URL = "https://t.me/vrazbore_bot";

function CtaButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={BOT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-lg font-bold text-black transition-all hover:from-amber-400 hover:to-amber-500 active:scale-95 shadow-lg shadow-amber-500/20 ${className}`}
    >
      {children}
    </a>
  );
}

function PhoneMockup({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label?: string;
}) {
  return (
    <div className="w-[220px] md:w-[240px] flex-shrink-0 snap-center flex flex-col items-center gap-3">
      <div className="border-[6px] border-zinc-800 rounded-[36px] bg-zinc-950 p-1 shadow-2xl">
        <div className="h-[420px] md:h-[460px] w-full rounded-[28px] bg-zinc-900/80 overflow-hidden">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-cover object-top"
            draggable={false}
          />
        </div>
      </div>
      {label && (
        <span className="text-sm text-zinc-400 font-medium">{label}</span>
      )}
    </div>
  );
}

function StepCard({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: React.ElementType;
  step: number;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: step * 0.15, duration: 0.5 }}
      className="flex flex-col items-center text-center gap-4 p-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Icon className="w-7 h-7 text-amber-500" />
      </div>
      <div className="text-xs font-bold text-amber-500/60 tracking-widest uppercase">
        Шаг {step}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed max-w-[250px]">
        {description}
      </p>
    </motion.div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex gap-4 items-start"
    >
      <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-amber-500" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export function TelegramRequired() {
  return (
    <div className="bg-neutral-950">
      {/* Секция 1: Hero */}
      <LampContainer
        className="justify-start pt-32 md:pt-50 !min-h-[80vh] md:!min-h-screen"
        contentClassName="translate-y-[-10rem] md:translate-y-[-15rem]"
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="flex flex-col items-center justify-center px-6 text-center"
        >
          <h1 className="mb-6 text-5xl md:text-7xl bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent font-rimma">
            В разборе
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-br from-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight mb-8 max-w-lg">
            Оценка авто по запчастям и мониторинг объявлений
          </h2>
          <CtaButton>Оценить авто бесплатно</CtaButton>
          <p className="mt-4 text-sm text-zinc-500">
            Бесплатно · Без регистрации · Через Telegram
          </p>
        </motion.div>
      </LampContainer>

      {/* Секция 2: Как это работает */}
      <section className="relative z-10 py-20 md:py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Как это работает
          </h2>
          <p className="text-zinc-400 text-lg">
            Оценка и мониторинг за минуту
          </p>
        </motion.div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <StepCard
            icon={Search}
            step={1}
            title="Выберите авто"
            description="Марка, модель и поколение из каталога"
          />
          <StepCard
            icon={Crosshair}
            step={2}
            title="Отметьте повреждения"
            description="Укажите зоны на трафарете кузова"
          />
          <StepCard
            icon={Calculator}
            step={3}
            title="Получите оценку"
            description="Потенциальная прибыль с разбора авто"
          />
          <StepCard
            icon={Bell}
            step={4}
            title="Отслеживайте объявления"
            description="Мониторинг новых авто на Авито в Telegram"
          />
        </div>
      </section>

      {/* Секция 3: Скриншоты */}
      <section className="relative z-10 py-20 md:py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Оценка авто и мониторинг объявлений
          </h2>
          <p className="text-zinc-400 text-lg max-w-md mx-auto">
            Рыночные цены на запчасти и отслеживание новых авто на Авито
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-8"
        >
          <PhoneMockup src={screenshotBrands} alt="Каталог марок и моделей" label="Каталог марок" />
          <PhoneMockup src={screenshotConfig} alt="Выбор конфигурации" label="Конфигурация" />
          <PhoneMockup src={screenshotEstimation} alt="Трафарет повреждений" label="Дефектовка" />
          <PhoneMockup src={screenshotResult} alt="Результат оценки" label="Результат" />
          <PhoneMockup src={screenshotMonitorEmpty} alt="Мониторинг объявлений" label="Мониторинг" />
          <PhoneMockup src={screenshotMonitor} alt="Активные подписки" label="Подписки" />
        </motion.div>
      </section>

      {/* Секция 4: Преимущества */}
      <section className="relative z-10 py-20 md:py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Почему В Разборе
          </h2>
        </motion.div>
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureCard
            icon={TrendingUp}
            title="Актуальные цены"
            description="Данные с Drom и Avito, обновляются регулярно"
            index={0}
          />
          <FeatureCard
            icon={Zap}
            title="Оценка за 30 секунд"
            description="Выберите авто, отметьте повреждения — готово"
            index={1}
          />
          <FeatureCard
            icon={Bell}
            title="Мониторинг Авито"
            description="Новые объявления прямо в Telegram"
            index={2}
          />
          <FeatureCard
            icon={Shield}
            title="Бесплатные оценки"
            description="3 бесплатные оценки"
            index={3}
          />
        </div>
      </section>

      {/* Секция 5: Финальный CTA */}
      <section className="relative z-10 py-20 md:py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center gap-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Готовы оценить авто?
          </h2>
          <CtaButton>Начать бесплатно</CtaButton>
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Send className="w-4 h-4" />
            <span>Работает в Telegram</span>
          </div>
        </motion.div>
      </section>

      {/* Секция 6: Footer */}
      <footer className="relative z-10 flex flex-col items-center gap-2 py-6 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} В Разборе</p>
        <div className="flex gap-4">
          <a
            href="https://vrazbore.tech/offers"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            Оферта
          </a>
          <a
            href="https://vrazbore.tech/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            Политика конфиденциальности
          </a>
        </div>
      </footer>
    </div>
  );
}
