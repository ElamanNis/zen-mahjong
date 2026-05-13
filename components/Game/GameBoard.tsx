'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  BrainCircuit,
  Crown,
  Eye,
  Flame,
  Layers,
  Lightbulb,
  LogIn,
  Medal,
  MoveRight,
  Palette,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Trophy,
  Undo2,
  X,
  Zap,
} from 'lucide-react';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import confetti from 'canvas-confetti';
import { Tile } from './Tile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGameStore, GameSkin } from '@/hooks/use-game-store';
import { areTilesMatching, isTileFree } from '@/lib/mahjong/engine';
import { buildCoachPlan, type CoachPlan } from '@/lib/mahjong/insights';
import { getLeaderboard, submitScore, type LeaderboardEntry } from '@/lib/supabase';

type Mission = {
  id: string;
  title: string;
  description: string;
  progress: number;
  done: boolean;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

const DAILY_XP = 250;
const TILE_SCALE = 34;
const BOARD_WIDTH = 18 * TILE_SCALE;
const BOARD_HEIGHT = 20 * TILE_SCALE;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function SessionClock({ startTime, isWon }: { startTime: number; isWon: boolean }) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (isWon) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isWon]);

  return <p className="mt-2 text-4xl font-light tracking-tight text-white">{formatTime(Math.floor((now - startTime) / 1000))}</p>;
}

function GuideStep({
  icon,
  index,
  title,
  description,
}: {
  icon: React.ReactNode;
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
          {icon}
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
          Шаг {index}
        </span>
      </div>
      <h4 className="text-lg font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function TutorialReel() {
  return (
    <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_35%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.94))] p-6">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_40%)]"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">Мини-разбор</p>
            <h4 className="mt-2 text-2xl font-semibold text-white">Как выглядит правильный ход</h4>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300">
            <PlayCircle className="h-4 w-4 text-emerald-300" />
            Живой пример
          </div>
        </div>

        <div className="relative mt-8 flex items-center justify-center gap-4">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, -2, 0] }}
            transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            className="flex h-28 w-20 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(255,255,255,0.08)]"
          >
            <span className="text-xl font-semibold text-blue-600">4</span>
            <span className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">dots</span>
          </motion.div>

          <motion.div
            animate={{ opacity: [0.4, 1, 0.4], x: [0, 4, 0] }}
            transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            className="rounded-full border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300"
          >
            <MoveRight className="h-5 w-5" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', delay: 0.14 }}
            className="flex h-28 w-20 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(255,255,255,0.08)]"
          >
            <span className="text-xl font-semibold text-blue-600">4</span>
            <span className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">dots</span>
          </motion.div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">1</p>
            <p className="mt-2 text-sm text-white">Ищите только свободные одинаковые плитки.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">2</p>
            <p className="mt-2 text-sm text-white">Сначала разгружайте верх и внешние края.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">3</p>
            <p className="mt-2 text-sm text-white">AI теперь подсвечивает конкретную пару, а не только советует словами.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowToPlayModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[2100] flex items-center justify-center bg-slate-950/92 p-4 backdrop-blur-xl sm:p-6"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 20 }}
            className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-[0_30px_100px_rgba(2,6,23,0.75)]"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/10 bg-slate-900/90 p-6 backdrop-blur-xl sm:p-8">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">Game Guide</p>
                <h3 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Инструкция без перегруза</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
                  Короткий визуальный разбор: что нажимать, как не зажимать поле и почему AI теперь показывает реальные пары на доске.
                </p>
              </div>

              <button onClick={onClose} className="rounded-2xl bg-slate-800 p-3 text-slate-300 transition hover:bg-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
                <TutorialReel />

                <div className="grid gap-4 md:grid-cols-3">
                  <GuideStep
                    index="1"
                    icon={<Eye className="h-5 w-5" />}
                    title="Выбирайте свободные плитки"
                    description="Плитка считается свободной, если сверху ничего не лежит и хотя бы одна боковая сторона открыта."
                  />
                  <GuideStep
                    index="2"
                    icon={<Layers className="h-5 w-5" />}
                    title="Разгружайте верх"
                    description="Пары на верхних слоях почти всегда ценнее: они открывают будущие ходы и уменьшают хаос в центре."
                  />
                  <GuideStep
                    index="3"
                    icon={<BrainCircuit className="h-5 w-5" />}
                    title="Используйте AI как навигатор"
                    description="Новый AI Coach показывает конкретные пары и может сразу подсветить лучший ход прямо на поле."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-emerald-500/15 bg-emerald-500/8 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-300">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/80">Памятка</p>
                      <h4 className="mt-1 text-xl font-semibold text-white">Три быстрых правила</h4>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm leading-6 text-slate-300">
                      Не кликайте по первой попавшейся паре: сначала смотрите, что она откроет после себя.
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm leading-6 text-slate-300">
                      Если ходов мало, безопаснее чистить край, а не разбирать центр наугад.
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm leading-6 text-slate-300">
                      Подсказка стоит меньше энергии, а AI-разбор лучше использовать в тупиковых или плотных позициях.
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white">Вместо длинного туториала</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Этот блок заменяет отдельное обучающее видео: всё нужное уже показано на одной красивой карточке прямо внутри игры.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-slate-900/80 p-4 text-sm leading-6 text-slate-300">
                    Если захотите, следующим шагом можно добавить уже настоящее встроенное видео или короткий GIF-разбор под этот же модальный экран.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GameBoard() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const store = useGameStore();
  const tiles = useGameStore((state) => state.tiles);
  const selectedId = useGameStore((state) => state.selectedId);
  const isWon = useGameStore((state) => state.isWon);
  const selectTile = useGameStore((state) => state.selectTile);
  const removeMatch = useGameStore((state) => state.removeMatch);
  const initGame = useGameStore((state) => state.initGame);
  const setPro = useGameStore((state) => state.setPro);
  const registerWin = useGameStore((state) => state.registerWin);
  const recordHintUsed = useGameStore((state) => state.recordHintUsed);
  const recordAiUsed = useGameStore((state) => state.recordAiUsed);
  const setHint = useGameStore((state) => state.setHint);

  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [coachPlan, setCoachPlan] = useState<CoachPlan | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!isUserLoaded) return;
    setPro(Boolean(user?.publicMetadata.isPro));
  }, [isUserLoaded, setPro, user]);

  const startRun = useCallback(
    (isDaily = false) => {
      initGame(isDaily);
      const currentTime = Date.now();
      setStartTime(currentTime);
      setCoachPlan(null);
      setHint(null);
    },
    [initGame, setHint],
  );

  useEffect(() => {
    let isActive = true;

    void getLeaderboard().then((data) => {
      if (isActive) {
        setLeaderboard(data);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!store.isWon) return;

    confetti({
      particleCount: 220,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });

    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    registerWin(elapsedTime);

    if (user) {
      void submitScore({
        userId: user.id,
        username: user.username || user.firstName || 'Zen Player',
        points: store.points,
        time: elapsedTime,
        mode: store.currentMode,
        usedHints: store.usedHintsThisRun,
        usedAi: store.usedAiThisRun,
        city: 'Global',
      }).then(async () => {
        const data = await getLeaderboard();
        setLeaderboard(data);
      });
    }
  }, [
    registerWin,
    startTime,
    store.currentMode,
    store.isWon,
    store.points,
    store.usedAiThisRun,
    store.usedHintsThisRun,
    user,
  ]);

  const activeTiles = store.tiles.filter((tile) => !tile.isRemoved);
  const tilesLeft = activeTiles.length;
  const levelProgress = (store.xp % DAILY_XP) / DAILY_XP;
  const isSignedIn = Boolean(user);
  const todayKey = new Date().toISOString().slice(0, 10);

  async function refreshLeaderboard() {
    const data = await getLeaderboard();
    setLeaderboard(data);
  }

  const achievements: Achievement[] = [
    {
      id: 'first-win',
      title: 'Первый баланс',
      description: 'Выиграйте хотя бы одну партию.',
      unlocked: store.gamesWon >= 1,
    },
    {
      id: 'combo',
      title: 'Комбо-мастер',
      description: 'Соберите серию из 5 успешных пар подряд.',
      unlocked: store.bestCombo >= 5,
    },
    {
      id: 'focus',
      title: 'Глубокий фокус',
      description: 'Завершите игру меньше чем за 8 минут.',
      unlocked: store.bestTimeSeconds !== null && store.bestTimeSeconds < 480,
    },
    {
      id: 'streak',
      title: 'Ритм дзена',
      description: 'Держите daily streak минимум 3 дня.',
      unlocked: store.dailyChallengeStreak >= 3,
    },
  ];

  const missions: Mission[] = [
    {
      id: 'score',
      title: '320 очков за сессию',
      description: 'Держите ритм и не сбрасывайте серию лишними ходами.',
      progress: Math.min(store.points / 320, 1),
      done: store.points >= 320,
    },
    {
      id: 'account',
      title: 'Сохранить рекорд в аккаунте',
      description: 'Войдите, чтобы прогресс и результаты были с вами на любом устройстве.',
      progress: isSignedIn ? 1 : 0.35,
      done: isSignedIn,
    },
    {
      id: 'daily',
      title: 'Закрыть ежедневный вызов',
      description: 'Пройдите дневную раскладку и поддержите серию.',
      progress: store.lastDailyCompletedOn === todayKey ? 1 : store.currentMode === 'daily' ? 0.65 : 0.1,
      done: store.lastDailyCompletedOn === todayKey,
    },
  ];

  const handleTileClick = useCallback(
    (id: string) => {
      if (isWon) return;

      const tile = tiles.find((item) => item.id === id);
      if (!tile) return;

      if (selectedId === id) {
        selectTile(null);
        return;
      }

      if (selectedId) {
        const selectedTile = tiles.find((item) => item.id === selectedId);
        if (selectedTile && areTilesMatching(selectedTile, tile)) {
          removeMatch(selectedId, id);
        } else {
          selectTile(id);
        }
        return;
      }

      selectTile(id);
    },
    [isWon, removeMatch, selectTile, selectedId, tiles],
  );

  const findHint = useCallback(() => {
    if (!store.useEnergy(10)) {
      alert('Недостаточно энергии. Подождите немного или перейдите на Pro.');
      return;
    }

    recordHintUsed();
    const plan = buildCoachPlan(activeTiles);
    const bestMove = plan.suggestedMoves[0];

    if (bestMove) {
      setHint(bestMove.ids);
    } else {
      setHint(null);
      alert('Сейчас открытых пар не видно. Попробуйте откатить ход или начать новую сессию.');
    }
  }, [activeTiles, recordHintUsed, setHint, store]);

  const askAiCoach = useCallback(async () => {
    if (!store.useEnergy(20)) {
      alert('Недостаточно энергии для AI-разбора.');
      return;
    }

    recordAiUsed();
    setIsAiLoading(true);

    const plan = buildCoachPlan(activeTiles);

    await new Promise((resolve) => setTimeout(resolve, 350));

    setCoachPlan(plan);
    setHint(plan.suggestedMoves[0]?.ids ?? null);
    setIsAiLoading(false);
  }, [activeTiles, recordAiUsed, setHint, store]);

  return (
    <div className="relative flex min-h-[680px] w-full flex-col gap-4 bg-slate-950/20 p-3 sm:p-4 xl:min-h-[780px] xl:flex-row xl:overflow-hidden 2xl:gap-6 2xl:p-6">
      <aside className="scrollbar-hide order-2 grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:order-1 xl:flex xl:w-[18rem] xl:flex-col xl:overflow-y-auto 2xl:w-80">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">Cloud Save</p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                {isSignedIn ? 'Прогресс привязан к аккаунту' : 'Войдите, чтобы сохранить прогресс'}
              </h2>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
              {isSignedIn ? <ShieldCheck className="h-5 w-5 text-emerald-300" /> : <LogIn className="h-5 w-5 text-emerald-300" />}
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-300">
            {isSignedIn
              ? 'Рекорды, ежедневная серия и будущие награды будут доступны на любом устройстве.'
              : 'Без входа игра сохранится только в этом браузере. С аккаунтом сохраняются результаты и история прогресса.'}
          </p>

          {!isSignedIn && (
            <div className="mt-5 flex flex-wrap gap-3">
              <SignInButton mode="modal">
                <button className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15">
                  Войти
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                  Создать аккаунт
                </button>
              </SignUpButton>
            </div>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5 shadow-xl backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xs uppercase tracking-[0.24em] text-slate-500">Сессия</h2>
              <SessionClock key={startTime} startTime={startTime} isWon={store.isWon} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
              <Zap className={cn('h-4 w-4 text-emerald-400', store.isPro && 'text-amber-400')} />
              <span className={cn('text-sm font-bold text-emerald-300', store.isPro && 'text-amber-300')}>
                {store.isPro ? '∞ энергия' : `${store.energy} энергии`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <Layers className="mb-2 h-4 w-4 text-emerald-400" />
              <p className="text-2xl font-semibold text-white">{tilesLeft}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Плиток осталось</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <Sparkles className="mb-2 h-4 w-4 text-sky-400" />
              <p className="text-2xl font-semibold text-white">{store.points}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Очки сессии</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <Flame className="mb-2 h-4 w-4 text-orange-400" />
              <p className="text-2xl font-semibold text-white">{store.combo}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Текущий combo</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <Trophy className="mb-2 h-4 w-4 text-violet-400" />
              <p className="text-2xl font-semibold text-white">{store.bestCombo}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Лучший combo</p>
            </div>
          </div>

          {!store.isPro && (
            <Button
              onClick={() => window.open(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK, '_blank', 'noopener,noreferrer')}
              className="mt-5 w-full gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-6 text-sm font-bold text-slate-950 shadow-lg shadow-orange-500/20 hover:from-amber-400 hover:to-orange-400"
            >
              <Crown className="h-4 w-4" />
              Разблокировать Pro
            </Button>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5 shadow-xl backdrop-blur-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Прогресс игрока</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Уровень {store.level}</h3>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300">
              {store.xp} XP
            </div>
          </div>

          <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400" style={{ width: `${Math.max(levelProgress * 100, 6)}%` }} />
          </div>
          <div className="mb-5 flex items-center justify-between text-xs text-slate-400">
            <span>До следующего уровня</span>
            <span>{DAILY_XP - (store.xp % DAILY_XP)} XP</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <Medal className="mb-2 h-4 w-4 text-amber-400" />
              <p className="text-lg font-semibold text-white">{store.gamesWon}</p>
              <p className="text-[11px] text-slate-500">Побед</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <Star className="mb-2 h-4 w-4 text-sky-400" />
              <p className="text-lg font-semibold text-white">{store.bestScore}</p>
              <p className="text-[11px] text-slate-500">Лучший счёт</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <Target className="mb-2 h-4 w-4 text-emerald-400" />
              <p className="text-lg font-semibold text-white">{store.dailyChallengeStreak}</p>
              <p className="text-[11px] text-slate-500">Daily streak</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5 shadow-xl backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xs uppercase tracking-[0.24em] text-slate-500">AI Coach</h2>
              <p className="mt-2 text-sm text-slate-400">Теперь показывает конкретные решения и может сразу подсветить лучший ход.</p>
            </div>
            <BrainCircuit className={cn('h-5 w-5 text-emerald-400', isAiLoading && 'animate-pulse')} />
          </div>

          <div className="flex flex-1 flex-col justify-between gap-4">
            {isAiLoading ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-emerald-500/15 bg-emerald-500/5 p-6 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
                <p className="text-sm text-slate-300">Сканирую расклад и собираю самые сильные пары...</p>
              </div>
            ) : coachPlan ? (
              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-emerald-500/15 bg-emerald-500/5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-300">
                      {coachPlan.snapshotLabel}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      {coachPlan.availablePairs} доступных пар
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{coachPlan.summary}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{coachPlan.focus}</p>
                </div>

                <div className="space-y-3">
                  {coachPlan.suggestedMoves.length > 0 ? (
                    coachPlan.suggestedMoves.map((move, index) => (
                      <div key={move.ids.join('-')} className="rounded-[1.5rem] border border-slate-800 bg-slate-950/55 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Решение {index + 1}</p>
                            <p className="mt-1 text-sm font-semibold text-white">{move.title}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{move.label}</p>
                            <p className="mt-2 text-xs leading-5 text-slate-500">{move.reason}</p>
                          </div>
                          <button
                            onClick={() => setHint(move.ids)}
                            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
                          >
                            Показать
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/55 p-4 text-sm leading-6 text-slate-400">
                      На поле не осталось открытых пар. Здесь лучше откатить ход или начать новую раскладку.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/50 p-4 text-sm leading-6 text-slate-400">
                  AI разберёт текущее поле, выберет лучшие доступные пары и покажет их прямо на доске без абстрактных фраз.
                </div>

                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="flex w-full items-center justify-between rounded-[1.5rem] border border-sky-500/15 bg-sky-500/8 px-4 py-3 text-left transition hover:bg-sky-500/12"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-sky-300" />
                    <div>
                      <p className="text-sm font-semibold text-white">Нужна быстрая инструкция?</p>
                      <p className="text-xs text-slate-400">Есть визуальный гид с мини-разбором хода.</p>
                    </div>
                  </div>
                  <MoveRight className="h-4 w-4 text-sky-300" />
                </button>
              </div>
            )}

            <div className="grid gap-3">
              <Button
                onClick={askAiCoach}
                disabled={isAiLoading || store.energy < 20}
                variant="outline"
                className="w-full gap-2 rounded-2xl border-emerald-500/20 bg-emerald-500/5 py-5 text-emerald-300 hover:bg-emerald-500/10"
              >
                <BrainCircuit className="h-4 w-4" />
                Показать решения за 20 энергии
              </Button>

              {coachPlan?.suggestedMoves[0] && (
                <Button
                  onClick={() => setHint(coachPlan.suggestedMoves[0].ids)}
                  variant="outline"
                  className="w-full gap-2 rounded-2xl border-white/10 bg-white/5 py-5 text-slate-200 hover:bg-white/10"
                >
                  <Eye className="h-4 w-4" />
                  Подсветить лучший ход ещё раз
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>

      <section className="relative order-1 flex min-h-[560px] w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/50 shadow-[0_30px_80px_rgba(2,6,23,0.55)] sm:min-h-[640px] sm:rounded-[2.5rem] xl:order-2 xl:min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_28%)]" />

        <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/75 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-slate-300 backdrop-blur-xl sm:left-6 sm:top-6 sm:text-xs">
          <span className={cn('h-2 w-2 rounded-full', store.currentMode === 'daily' ? 'bg-orange-400' : 'bg-emerald-400')} />
          {store.currentMode === 'daily' ? 'Ежедневный вызов' : 'Режим фокуса'}
        </div>

        <button
          onClick={() => setIsGuideOpen(true)}
          className="absolute left-4 top-16 z-20 flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 backdrop-blur-xl transition hover:bg-sky-500/15 sm:left-auto sm:right-6 sm:top-6"
        >
          <BookOpen className="h-4 w-4" />
          Инструкция игры
        </button>

        <div className="relative flex h-full w-full items-center justify-center overflow-x-auto overflow-y-hidden px-2 pb-24 pt-24 sm:px-8 sm:py-16">
          <div
            className="relative origin-center scale-[0.56] sm:scale-[0.76] md:scale-[0.9] lg:scale-[1.02] xl:scale-[1.12] 2xl:scale-[1.18]"
            style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
          >
            <AnimatePresence initial={false}>
              {store.tiles.map(
                (tile) =>
                  !tile.isRemoved && (
                    <Tile
                      key={tile.id}
                      tile={tile}
                      isFree={isTileFree(tile, activeTiles)}
                      isSelected={store.selectedId === tile.id}
                      isHinted={store.hintIds?.includes(tile.id) || false}
                      onClick={handleTileClick}
                    />
                  ),
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center gap-2 overflow-x-auto rounded-[1.25rem] border border-white/10 bg-slate-950/85 p-2 shadow-2xl backdrop-blur-xl sm:bottom-8 sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2 sm:rounded-[1.5rem]">
          <button
            onClick={() => store.undo()}
            className="rounded-xl p-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white disabled:opacity-30"
            disabled={store.history.length === 0}
            title="Назад"
          >
            <Undo2 className="h-5 w-5" />
          </button>

          <div className="mx-1 h-8 w-px bg-slate-700" />

          <button
            onClick={findHint}
            className="group flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 sm:px-8"
          >
            <Lightbulb className="h-5 w-5 transition-transform group-hover:scale-110" />
            Подсказка
          </button>

          <div className="mx-1 h-8 w-px bg-slate-700" />

          <button
            onClick={() => setIsShopOpen(true)}
            className="rounded-xl p-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
            title="Магазин стилей"
          >
            <Palette className="h-5 w-5" />
          </button>

          <button
            onClick={() => startRun(false)}
            className="group rounded-xl p-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
            title="Начать заново"
          >
            <RotateCcw className="h-5 w-5 transition-transform group-hover:-rotate-90" />
          </button>
        </div>

        <AnimatePresence>
          {store.isWon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-950/85 p-6 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 p-10 text-center shadow-[0_25px_90px_rgba(15,23,42,0.7)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400" />
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                  <Trophy className="h-12 w-12 text-emerald-300" />
                </div>
                <h2 className="mb-3 text-4xl font-medium text-white">Финишный дзен</h2>
                <p className="mb-8 text-sm leading-7 text-slate-300">
                  Вы закрыли расклад за <span className="font-mono text-emerald-300">{formatTime(store.lastCompletedTimeSeconds ?? 0)}</span> и
                  заработали <span className="font-semibold text-white"> {store.points} очков</span>.
                </p>

                <div className="mb-8 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-lg font-semibold text-white">{store.usedHintsThisRun}</p>
                    <p className="text-[11px] text-slate-500">Подсказок</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-lg font-semibold text-white">{store.usedAiThisRun}</p>
                    <p className="text-[11px] text-slate-500">AI-разборов</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-lg font-semibold text-white">+{Math.min(store.points, 500) + 100}</p>
                    <p className="text-[11px] text-slate-500">XP награда</p>
                  </div>
                </div>

                <Button
                  onClick={() => startRun(false)}
                  size="lg"
                  className="w-full rounded-2xl bg-emerald-500 py-7 text-lg font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] hover:bg-emerald-400"
                >
                  Запустить новую сессию
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <aside className="scrollbar-hide order-3 grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:flex xl:w-[18rem] xl:flex-col xl:overflow-y-auto 2xl:w-80">
        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5 shadow-xl backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Вызов дня</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Поддерживайте серию</h3>
            </div>
            <div className="rounded-2xl bg-orange-500/10 p-3">
              <Trophy className="h-5 w-5 text-orange-300" />
            </div>
          </div>

          <div className="rounded-3xl border border-orange-500/10 bg-orange-500/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Сегодняшняя цель</p>
                <p className="text-xs text-slate-400">Закройте daily challenge без спешки и сохраните streak.</p>
              </div>
              <span className="rounded-full bg-orange-400/20 px-2.5 py-1 text-xs font-semibold text-orange-200">
                {store.dailyChallengeStreak} days
              </span>
            </div>
            <Button
              onClick={() => startRun(true)}
              className="mt-2 w-full rounded-2xl bg-orange-400 text-slate-950 hover:bg-orange-300"
            >
              Запустить daily run
            </Button>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5 shadow-xl backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Миссии</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Что качает аккаунт</h3>
            </div>
            <Target className="h-5 w-5 text-emerald-300" />
          </div>

          <div className="space-y-3">
            {missions.map((mission) => (
              <div key={mission.id} className="rounded-3xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{mission.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{mission.description}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                      mission.done ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400',
                    )}
                  >
                    {mission.done ? 'done' : `${Math.round(mission.progress * 100)}%`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                    style={{ width: `${Math.max(mission.progress * 100, 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5 shadow-xl backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Достижения</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Коллекция прогресса</h3>
            </div>
            <Medal className="h-5 w-5 text-violet-300" />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  'rounded-3xl border p-4 transition-all',
                  achievement.unlocked ? 'border-emerald-500/20 bg-emerald-500/8' : 'border-slate-800 bg-slate-950/50',
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{achievement.title}</p>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                      achievement.unlocked ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400',
                    )}
                  >
                    {achievement.unlocked ? 'unlock' : 'locked'}
                  </span>
                </div>
                <p className="text-xs leading-5 text-slate-400">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5 shadow-xl backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Leaderboard</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Лучшие игроки</h3>
            </div>
            <button onClick={refreshLeaderboard} className="rounded-2xl bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="scrollbar-hide space-y-3 overflow-y-auto pr-2">
            {leaderboard.length > 0 ? (
              leaderboard.map((item, idx) => (
                <div
                  key={`${item.username}-${item.score}-${idx}`}
                  className={cn(
                    'rounded-3xl border p-4',
                    idx === 0 ? 'border-emerald-500/20 bg-emerald-500/8' : 'border-slate-800 bg-slate-950/50',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={cn('font-mono text-sm font-semibold', idx === 0 ? 'text-emerald-300' : 'text-slate-500')}>
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{item.username}</p>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          {item.mode} · {item.city}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{item.score} pts</p>
                      <p className="text-[11px] text-slate-500">{formatTime(item.timeSeconds)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center text-sm text-slate-500">
                Лидерборд загрузится после первых сохранённых результатов.
              </div>
            )}
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {isShopOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-950/90 p-6 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-[0_25px_90px_rgba(15,23,42,0.7)]"
            >
              <div className="flex items-center justify-between border-b border-slate-800 p-8">
                <div>
                  <h3 className="text-3xl font-medium text-white">Выбор атмосферы</h3>
                  <p className="mt-2 text-sm text-slate-400">Оформление влияет на ощущение ритма и визуальный тон партии.</p>
                </div>
                <button onClick={() => setIsShopOpen(false)} className="rounded-2xl bg-slate-800 p-3 transition hover:bg-slate-700">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-3">
                {(['zen', 'neon', 'nature'] as GameSkin[]).map((skin) => (
                  <button
                    key={skin}
                    onClick={() => {
                      store.setSkin(skin);
                      setIsShopOpen(false);
                    }}
                    className={cn(
                      'group relative flex flex-col overflow-hidden rounded-[2rem] border-2 p-6 text-left transition-all',
                      store.skin === skin
                        ? 'border-emerald-400 bg-slate-800 shadow-lg shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700',
                    )}
                  >
                    <div
                      className={cn(
                        'mb-5 h-14 w-14 rounded-2xl transition-transform group-hover:scale-110',
                        skin === 'zen'
                          ? 'bg-white shadow-[0_0_18px_rgba(255,255,255,0.45)]'
                          : skin === 'neon'
                            ? 'bg-indigo-500 shadow-[0_0_22px_rgba(99,102,241,0.55)]'
                            : 'bg-emerald-600 shadow-[0_0_22px_rgba(5,150,105,0.55)]',
                      )}
                    />
                    <h4 className="mb-2 text-xl font-semibold capitalize text-white">{skin}</h4>
                    <p className="text-sm leading-6 text-slate-400">
                      {skin === 'zen'
                        ? 'Чистый свет, спокойные плитки и больше воздуха между элементами.'
                        : skin === 'neon'
                          ? 'Более смелый контраст, энергия аркады и фокус на движении.'
                          : 'Мягкие землистые цвета для более тёплого, природного ритма.'}
                    </p>
                    {store.skin === skin && (
                      <div className="absolute right-4 top-4 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                        active
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between bg-slate-800/30 p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10">
                    <ShoppingBag className="h-5 w-5 text-emerald-300" />
                  </div>
                  <p className="text-sm text-slate-300">Позже сюда можно добавить платные темы, сезонные скины и спец-паки.</p>
                </div>
                <Button onClick={() => setIsShopOpen(false)} className="rounded-2xl bg-emerald-500 px-8 text-slate-950 hover:bg-emerald-400">
                  Применить
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HowToPlayModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
