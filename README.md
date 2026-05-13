# Zen Mahjong

Zen Mahjong is a polished browser mahjong solitaire experience with calm visuals, account sync, daily runs, AI move guidance, progression, and Stripe-ready upgrade flow.

## What I built

- A larger and more comfortable game board layout with reduced visual jitter.
- An AI Coach that suggests real playable pairs and can highlight them on the board.
- A visual in-app game guide with infographic-style onboarding.
- Local progression with wins, XP, streaks, achievements, and session stats.
- Supabase leaderboard integration for saved scores.
- Clerk authentication and Stripe checkout endpoints for account/pro upgrade flows.

## Who it is for

- Casual players who want a calm and readable mahjong experience.
- Mobile and desktop users who benefit from clear onboarding and larger interactive elements.
- Product teams that want a game prototype already shaped like a deployable SaaS-style product.

## Why it is valuable

- The interface now feels easier to read and less tiring during longer sessions.
- New players get immediate help through the in-app guide instead of getting lost.
- The AI Coach is useful in practice because it points to actual moves, not vague advice.
- The project already includes the core monetization and retention pieces needed for a real launch.

## Tech stack

- Next.js 15
- React 19
- Tailwind CSS 4
- Zustand
- Clerk
- Supabase
- Stripe
- Groq API

## Local run

1. Install dependencies:
   `npm install`
2. Create `.env.local` from `.env.example` and fill in Clerk, Supabase, Stripe, and Groq keys.
3. Start the app:
   `npm run dev`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`

## Deployment

The project is configured for Vercel deployment.
