import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { TileInstance, LAYOUT_TURTLE } from '@/lib/mahjong/types';
import { generateSolvableBoard } from '@/lib/mahjong/engine';

export type GameSkin = 'zen' | 'neon' | 'nature';
export type GameMode = 'calm' | 'daily';

interface GameState {
  tiles: TileInstance[];
  history: TileInstance[][];
  selectedId: string | null;
  hintIds: [string, string] | null;
  moves: number;
  energy: number;
  points: number;
  isWon: boolean;
  skin: GameSkin;
  isPro: boolean;
  currentMode: GameMode;
  usedHintsThisRun: number;
  usedAiThisRun: number;
  combo: number;
  bestCombo: number;
  gamesPlayed: number;
  gamesWon: number;
  bestScore: number;
  bestTimeSeconds: number | null;
  lastCompletedTimeSeconds: number | null;
  hintsUsedTotal: number;
  aiUsedTotal: number;
  dailyChallengeStreak: number;
  lastDailyCompletedOn: string | null;
  xp: number;
  level: number;
  initGame: (isDaily?: boolean) => void;
  selectTile: (id: string | null) => void;
  removeMatch: (id1: string, id2: string) => void;
  undo: () => void;
  setHint: (ids: [string, string] | null) => void;
  useEnergy: (amount: number) => boolean;
  setSkin: (skin: GameSkin) => void;
  addPoints: (points: number) => void;
  regenEnergy: () => void;
  setPro: (isPro: boolean) => void;
  recordHintUsed: () => void;
  recordAiUsed: () => void;
  registerWin: (elapsedTime: number) => void;
}

const getTodayKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isYesterday = (dateString: string | null) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

const calculateLevel = (xp: number) => Math.floor(xp / 250) + 1;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      tiles: generateSolvableBoard(LAYOUT_TURTLE),
      history: [],
      selectedId: null,
      hintIds: null,
      moves: 0,
      energy: 100,
      points: 0,
      isWon: false,
      skin: 'zen',
      isPro: false,
      currentMode: 'calm',
      usedHintsThisRun: 0,
      usedAiThisRun: 0,
      combo: 0,
      bestCombo: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      bestScore: 0,
      bestTimeSeconds: null,
      lastCompletedTimeSeconds: null,
      hintsUsedTotal: 0,
      aiUsedTotal: 0,
      dailyChallengeStreak: 0,
      lastDailyCompletedOn: null,
      xp: 0,
      level: 1,

      initGame: (isDaily = false) => {
        let seed: number | undefined;
        if (isDaily) {
          const today = new Date();
          seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        }

        const newTiles = generateSolvableBoard(LAYOUT_TURTLE, seed);
        set((state) => ({
          tiles: newTiles,
          history: [],
          selectedId: null,
          hintIds: null,
          moves: 0,
          points: 0,
          isWon: false,
          currentMode: isDaily ? 'daily' : 'calm',
          usedHintsThisRun: 0,
          usedAiThisRun: 0,
          combo: 0,
          lastCompletedTimeSeconds: null,
          gamesPlayed: state.gamesPlayed + 1,
        }));
      },

      selectTile: (id) => set({ selectedId: id }),

      removeMatch: (id1, id2) => {
        const { tiles, moves, history, points, combo, bestCombo } = get();
        const newHistory = [...history, [...tiles]];
        const newTiles = tiles.map((tile) =>
          tile.id === id1 || tile.id === id2 ? { ...tile, isRemoved: true } : tile,
        );
        const remaining = newTiles.filter((tile) => !tile.isRemoved).length;
        const nextCombo = combo + 1;
        const pairBonus = 10 + Math.min(nextCombo, 5) * 4;

        set({
          tiles: newTiles,
          history: newHistory,
          moves: moves + 1,
          selectedId: null,
          hintIds: null,
          points: points + pairBonus,
          combo: nextCombo,
          bestCombo: Math.max(bestCombo, nextCombo),
          isWon: remaining === 0,
        });
      },

      undo: () => {
        const { history, moves } = get();
        if (history.length === 0) return;

        const previous = history[history.length - 1];
        set({
          tiles: previous,
          history: history.slice(0, -1),
          moves: Math.max(0, moves - 1),
          selectedId: null,
          hintIds: null,
          isWon: false,
          combo: 0,
          lastCompletedTimeSeconds: null,
        });
      },

      setHint: (ids) => set({ hintIds: ids }),

      useEnergy: (amount) => {
        const { energy, isPro } = get();
        if (isPro) return true;
        if (energy < amount) return false;
        set({ energy: energy - amount });
        return true;
      },

      setSkin: (skin) => set({ skin }),

      addPoints: (points) => set((state) => ({ points: state.points + points })),

      regenEnergy: () => set((state) => ({ energy: Math.min(100, state.energy + 1) })),

      setPro: (isPro) => set({ isPro }),

      recordHintUsed: () =>
        set((state) => ({
          usedHintsThisRun: state.usedHintsThisRun + 1,
          hintsUsedTotal: state.hintsUsedTotal + 1,
          combo: 0,
        })),

      recordAiUsed: () =>
        set((state) => ({
          usedAiThisRun: state.usedAiThisRun + 1,
          aiUsedTotal: state.aiUsedTotal + 1,
        })),

      registerWin: (elapsedTime) => {
        const {
          points,
          gamesWon,
          bestScore,
          bestTimeSeconds,
          currentMode,
          dailyChallengeStreak,
          lastDailyCompletedOn,
          xp,
        } = get();

        const todayKey = getTodayKey();
        let nextDailyStreak = dailyChallengeStreak;
        let nextDailyCompletedOn = lastDailyCompletedOn;

        if (currentMode === 'daily' && lastDailyCompletedOn !== todayKey) {
          nextDailyStreak = isYesterday(lastDailyCompletedOn) ? dailyChallengeStreak + 1 : 1;
          nextDailyCompletedOn = todayKey;
        }

        const xpGain = (currentMode === 'daily' ? 140 : 100) + Math.min(points, 500) + Math.max(0, 180 - elapsedTime);
        const nextXp = xp + xpGain;

        set({
          gamesWon: gamesWon + 1,
          bestScore: Math.max(bestScore, points),
          bestTimeSeconds:
            bestTimeSeconds === null ? elapsedTime : Math.min(bestTimeSeconds, elapsedTime),
          lastCompletedTimeSeconds: elapsedTime,
          dailyChallengeStreak: nextDailyStreak,
          lastDailyCompletedOn: nextDailyCompletedOn,
          xp: nextXp,
          level: calculateLevel(nextXp),
        });
      },
    }),
    {
      name: 'zen-mahjong-state-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tiles: state.tiles,
        history: state.history,
        moves: state.moves,
        energy: state.energy,
        points: state.points,
        isWon: state.isWon,
        skin: state.skin,
        isPro: state.isPro,
        currentMode: state.currentMode,
        usedHintsThisRun: state.usedHintsThisRun,
        usedAiThisRun: state.usedAiThisRun,
        combo: state.combo,
        bestCombo: state.bestCombo,
        gamesPlayed: state.gamesPlayed,
        gamesWon: state.gamesWon,
        bestScore: state.bestScore,
        bestTimeSeconds: state.bestTimeSeconds,
        lastCompletedTimeSeconds: state.lastCompletedTimeSeconds,
        hintsUsedTotal: state.hintsUsedTotal,
        aiUsedTotal: state.aiUsedTotal,
        dailyChallengeStreak: state.dailyChallengeStreak,
        lastDailyCompletedOn: state.lastDailyCompletedOn,
        xp: state.xp,
        level: state.level,
      }),
    },
  ),
);
