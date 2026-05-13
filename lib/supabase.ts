import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { GameMode } from '@/hooks/use-game-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export type LeaderboardEntry = {
  username: string;
  score: number;
  timeSeconds: number;
  city: string;
  mode: GameMode | 'sprint';
  challengeDate: string;
};

type SubmitScoreInput = {
  userId: string;
  username: string;
  points: number;
  time: number;
  mode: GameMode;
  usedHints: number;
  usedAi: number;
  city?: string;
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

export async function submitScore({
  userId,
  username,
  points,
  time,
  mode,
  usedHints,
  usedAi,
  city = 'Global',
}: SubmitScoreInput) {
  const client = getSupabase();
  if (!client) return { error: 'Supabase not configured' };

  const { data, error } = await client.from('mahjong_scores').insert([
    {
      user_id: userId,
      username,
      city,
      challenge_date: new Date().toISOString().slice(0, 10),
      mode,
      score: points,
      time_seconds: time,
      used_hints: usedHints,
      used_ai: usedAi,
    },
  ]);

  if (error) console.error('Error submitting score:', error);
  return { data, error };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('mahjong_scores')
    .select('username, score, time_seconds, city, mode, challenge_date')
    .order('score', { ascending: false })
    .order('time_seconds', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return (data ?? []).map((entry) => ({
    username: entry.username,
    score: entry.score,
    timeSeconds: entry.time_seconds,
    city: entry.city,
    mode: entry.mode,
    challengeDate: entry.challenge_date,
  }));
}
