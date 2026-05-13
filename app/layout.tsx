import type {Metadata} from 'next';
import {Inter, Playfair_Display} from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Zen Mahjong | Daily Focus Mahjong with Progression',
  description: 'Release-ready Zen Mahjong with account sync, daily challenges, AI coach, progression and premium upgrade flow.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <ClerkProvider>
      <html lang="ru" className={`${inter.variable} ${playfair.variable} h-full`}>
        <body suppressHydrationWarning className="bg-[#0F172A] text-slate-100 antialiased h-full">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
