'use client';

import React, { useEffect } from 'react';
import { SignInButton, SignUpButton, UserButton, useAuth, useUser } from '@clerk/nextjs';
import { Cloud, ShieldCheck, Star, Trophy } from 'lucide-react';
import { GameBoard } from '@/components/Game/GameBoard';
import { useGameStore } from '@/hooks/use-game-store';

function FeaturePill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300 sm:px-3 sm:text-[11px]">
      {label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  hint: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <div className={`mb-3 flex items-center gap-2 ${accent}`}>
        {icon}
        <span className="text-[11px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{hint}</p>
    </div>
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
      <header className="relative z-20 border-b border-white/10 bg-slate-950/75 px-4 py-3 backdrop-blur-xl md:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 shadow-[0_0_30px_rgba(16,185,129,0.18)] sm:h-12 sm:w-12">
              <span className="text-lg font-bold text-emerald-300 sm:text-xl">ZM</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Zen Mahjong</h1>
              <p className="text-xs text-slate-400 sm:text-sm">Mindful puzzle game with account sync, daily runs and live progression.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FeaturePill label="Cloud Save" />
            <FeaturePill label="Daily Challenge" />
            <FeaturePill label="AI Coach" />
            <FeaturePill label="Progression" />
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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

      <section className="relative z-10 border-b border-white/8 bg-slate-950/55 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.76))] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.32)]">
            <div className="flex flex-wrap items-center gap-2">
              <FeaturePill label={isSignedIn ? 'Sync Active' : 'Guest Mode'} />
              <FeaturePill label={`${dailyChallengeStreak} Day Streak`} />
            </div>
            <h2 className="mt-4 max-w-2xl text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Спокойный маджонг с прогрессом, AI-подсказками и ежедневным ритмом.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              На ПК интерфейс остаётся просторным и насыщенным, а на телефоне собирается в компактный мобильный сценарий, где главный акцент остаётся на самом поле.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/8 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/80">Cloud Save</p>
                <p className="mt-1 text-sm font-semibold text-white">{isSignedIn ? 'Прогресс синхронизируется' : 'Можно играть без входа'}</p>
              </div>
              <div className="rounded-2xl border border-sky-500/15 bg-sky-500/8 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300/80">AI Coach</p>
                <p className="mt-1 text-sm font-semibold text-white">Показывает реальные пары и ходы</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <MetricCard
              label="Save"
              value={isSignedIn ? 'On' : 'Off'}
              icon={<Cloud className="h-4 w-4" />}
              accent="text-emerald-300"
              hint={isSignedIn ? 'Данные привязаны к аккаунту.' : 'Локальный режим без синхронизации.'}
            />
            <MetricCard
              label="Wins"
              value={gamesWon}
              icon={<Trophy className="h-4 w-4" />}
              accent="text-orange-300"
              hint="Количество побед в вашем профиле."
            />
            <MetricCard
              label="Best"
              value={bestScore}
              icon={<Star className="h-4 w-4" />}
              accent="text-sky-300"
              hint={`Лучший счёт и серия: ${dailyChallengeStreak} дн.`}
            />
          </div>
        </div>
      </section>

      <div className="flex-1">
        <GameBoard />
      </div>

      <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-4 text-xs text-slate-400 backdrop-blur-xl md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-4">
            <span>Zen Mahjong</span>
            <span>AI Coach online</span>
            <span>Supabase connected</span>
          </div>
          <span>Responsive for desktop and mobile</span>
        </div>
      </footer>
    </main>
  );
}
