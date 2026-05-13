'use client';

import React, { useEffect } from 'react';
import { SignInButton, SignUpButton, UserButton, useAuth, useUser } from '@clerk/nextjs';
import { Cloud, ShieldCheck, Sparkles, Star, Trophy } from 'lucide-react';
import { GameBoard } from '@/components/Game/GameBoard';
import { useGameStore } from '@/hooks/use-game-store';

function FeaturePill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
      {label}
    </span>
  );
}

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const regenEnergy = useGameStore((state) => state.regenEnergy);
  const gamesWon = useGameStore((state) => state.gamesWon);
  const dailyChallengeStreak = useGameStore((state) => state.dailyChallengeStreak);
  const bestScore = useGameStore((state) => state.bestScore);

  useEffect(() => {
    const interval = setInterval(() => {
      regenEnergy();
    }, 60000);

    return () => clearInterval(interval);
  }, [regenEnergy]);

  return (
    <main className="flex h-full min-h-screen flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30%),#020617] text-slate-100">
      <header className="relative z-20 border-b border-white/10 bg-slate-950/75 px-6 py-3 backdrop-blur-xl md:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 shadow-[0_0_30px_rgba(16,185,129,0.18)]">
              <span className="text-xl font-bold text-emerald-300">ZM</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Zen Mahjong</h1>
              <p className="text-sm text-slate-400">Mindful puzzle game with account sync, daily runs and live progression.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FeaturePill label="Cloud Save" />
            <FeaturePill label="Daily Challenge" />
            <FeaturePill label="AI Coach" />
            <FeaturePill label="Progression" />
          </div>

          <div className="flex items-center gap-3">
            {!isLoaded ? (
              <div className="h-10 w-28 animate-pulse rounded-full bg-slate-800" />
            ) : isSignedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 md:flex">
                  <ShieldCheck className="h-4 w-4" />
                  Прогресс синхронизируется
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  {user?.firstName || user?.username || 'Player'}
                </div>
                <UserButton />
              </div>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                    Войти
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                    Создать аккаунт
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative z-10 border-b border-white/8 bg-slate-950/55 px-6 py-4 backdrop-blur-xl md:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300/80">Release Ready Layer</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
              Сайт уже можно доводить до реального внедрения: аккаунт, ежедневная серия, миссии и понятная ценность с первого экрана.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Если пользователь входит в аккаунт, мы показываем, что рекорды и прогресс сохраняются. Если нет, интерфейс мягко объясняет зачем авторизация нужна и что именно она открывает.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3.5">
              <div className="mb-2 flex items-center gap-2 text-emerald-300">
                <Cloud className="h-4 w-4" />
                <span className="text-[11px] uppercase tracking-[0.18em]">Save</span>
              </div>
              <p className="text-2xl font-semibold text-white">{isSignedIn ? 'On' : 'Off'}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Сохранение прогресса и рекордов через аккаунт.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3.5">
              <div className="mb-2 flex items-center gap-2 text-orange-300">
                <Trophy className="h-4 w-4" />
                <span className="text-[11px] uppercase tracking-[0.18em]">Wins</span>
              </div>
              <p className="text-2xl font-semibold text-white">{gamesWon}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Побед уже накоплено в вашем локальном профиле.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3.5">
              <div className="mb-2 flex items-center gap-2 text-sky-300">
                <Star className="h-4 w-4" />
                <span className="text-[11px] uppercase tracking-[0.18em]">Best</span>
              </div>
              <p className="text-2xl font-semibold text-white">{bestScore}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Личный лучший счёт и streak: {dailyChallengeStreak} дней.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1">
        <GameBoard />
      </div>

      <footer className="border-t border-white/10 bg-slate-950/80 px-6 py-4 text-xs text-slate-400 backdrop-blur-xl md:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-4">
            <span>Zen Mahjong v3 release candidate</span>
            <span>AI Coach online</span>
            <span>Stripe checkout ready</span>
            <span>Supabase leaderboard enabled</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <span>Следующий шаг: профиль игрока, инвентарь тем и таблица достижений в Supabase.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
