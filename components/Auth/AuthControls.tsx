'use client';

import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AuthControls() {
  const { isLoaded, userId } = useAuth();

  if (!clerkEnabled) {
    return (
      <div className="rounded-full border border-stone-800/8 bg-stone-50 px-4 py-3 text-sm text-stone-600">
        Demo mode without Clerk keys
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="h-11 w-[220px]" aria-hidden="true" />;
  }

  if (userId) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-stone-800/8 bg-stone-50 px-4 py-2">
        <span className="text-sm text-stone-700">Аккаунт подключен</span>
        <UserButton />
      </div>
    );
  }

  return (
    <>
      <SignInButton mode="modal">
        <button className="rounded-full border border-stone-800/8 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-50">
          Войти
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
          Начать путь
          <ArrowRight className="h-4 w-4" />
        </button>
      </SignUpButton>
    </>
  );
}
