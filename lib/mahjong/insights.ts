import { areTilesMatching, isTileFree } from './engine';
import { TileInstance } from './types';

interface MovePairSummary {
  left: TileInstance;
  right: TileInstance;
}

export interface CoachContext {
  tilesLeft: number;
  freeTiles: number;
  availablePairs: number;
  topLayerTiles: number;
  dominantLabel: string;
  suggestedFocus: string;
}

export interface CoachMoveRecommendation {
  ids: [string, string];
  label: string;
  title: string;
  reason: string;
  score: number;
}

export interface CoachPlan {
  snapshotLabel: string;
  summary: string;
  focus: string;
  freeTiles: number;
  availablePairs: number;
  suggestedMoves: CoachMoveRecommendation[];
}

function isOverlap(a: TileInstance, b: TileInstance) {
  return Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2;
}

function getTileLabel(tile: TileInstance) {
  if (tile.type.category === 'suit') {
    const suitName =
      tile.type.suit === 'bamboo'
        ? 'bamboo'
        : tile.type.suit === 'dot'
          ? 'dots'
          : 'characters';
    return `${suitName} ${tile.type.value}`;
  }

  if (tile.type.category === 'wind') {
    return `${tile.type.direction} wind`;
  }

  if (tile.type.category === 'dragon') {
    return `${tile.type.color} dragon`;
  }

  if (tile.type.category === 'flower') {
    return `flower ${tile.type.type}`;
  }

  return `season ${tile.type.type}`;
}

export function describeTilePair(left: TileInstance, right: TileInstance) {
  const label = getTileLabel(left);
  return `${label} + ${getTileLabel(right)}`.replace(`${label} + ${label}`, `${label} x2`);
}

function countTilesReleasedByTopPressure(pair: MovePairSummary, activeTiles: TileInstance[]) {
  const pairIds = new Set([pair.left.id, pair.right.id]);

  return activeTiles.filter((tile) => {
    if (pairIds.has(tile.id)) return false;
    if (tile.z + 1 !== pair.left.z && tile.z + 1 !== pair.right.z) return false;

    const coveredByLeft = pair.left.z === tile.z + 1 && isOverlap(pair.left, tile);
    const coveredByRight = pair.right.z === tile.z + 1 && isOverlap(pair.right, tile);

    return coveredByLeft || coveredByRight;
  }).length;
}

function countSideRelief(pair: MovePairSummary, activeTiles: TileInstance[]) {
  const pairIds = new Set([pair.left.id, pair.right.id]);

  return activeTiles.filter((tile) => {
    if (pairIds.has(tile.id)) return false;
    if (tile.z !== pair.left.z && tile.z !== pair.right.z) return false;

    const adjacentToLeft =
      tile.z === pair.left.z &&
      Math.abs(tile.y - pair.left.y) < 2 &&
      (tile.x === pair.left.x - 2 || tile.x === pair.left.x + 2);
    const adjacentToRight =
      tile.z === pair.right.z &&
      Math.abs(tile.y - pair.right.y) < 2 &&
      (tile.x === pair.right.x - 2 || tile.x === pair.right.x + 2);

    return adjacentToLeft || adjacentToRight;
  }).length;
}

function scoreMove(pair: MovePairSummary, activeTiles: TileInstance[], context: CoachContext) {
  const topRelief = countTilesReleasedByTopPressure(pair, activeTiles);
  const sideRelief = countSideRelief(pair, activeTiles);
  const edgeBonus =
    Number(pair.left.x <= 3 || pair.left.x >= 14) +
    Number(pair.right.x <= 3 || pair.right.x >= 14);
  const layerBonus = pair.left.z + pair.right.z;
  const safetyBonus = context.availablePairs <= 3 ? 2 : 0;

  const score = topRelief * 10 + sideRelief * 4 + edgeBonus * 3 + layerBonus * 2 + safetyBonus;

  let title = 'Сохранить темп';
  let reason = 'Пара открыта уже сейчас и не ломает ритм партии.';

  if (topRelief >= 2) {
    title = 'Снять верхний зажим';
    reason = 'Этот ход убирает давление сверху и открывает плитки под ним.';
  } else if (sideRelief >= 3) {
    title = 'Открыть боковой коридор';
    reason = 'После этой пары по краю появится больше свободного пространства.';
  } else if (edgeBonus >= 2) {
    title = 'Почистить внешний край';
    reason = 'Безопасный ход по краю помогает не зажимать поле в центре.';
  } else if (context.availablePairs <= 3) {
    title = 'Редкое окно';
    reason = 'Сейчас ходов мало, поэтому лучше забрать гарантированную открытую пару.';
  }

  return {
    ids: [pair.left.id, pair.right.id] as [string, string],
    label: describeTilePair(pair.left, pair.right),
    title,
    reason,
    score,
  };
}

export function getAvailablePairs(activeTiles: TileInstance[]) {
  const freeTiles = activeTiles.filter((tile) => isTileFree(tile, activeTiles));
  const pairs: MovePairSummary[] = [];

  for (let i = 0; i < freeTiles.length; i += 1) {
    for (let j = i + 1; j < freeTiles.length; j += 1) {
      if (areTilesMatching(freeTiles[i], freeTiles[j])) {
        pairs.push({ left: freeTiles[i], right: freeTiles[j] });
      }
    }
  }

  return { freeTiles, pairs };
}

export function buildCoachContext(
  activeTiles: TileInstance[],
  freeTiles: TileInstance[],
  availablePairs: MovePairSummary[],
): CoachContext {
  const labelCounts = new Map<string, number>();

  for (const tile of freeTiles) {
    const label = getTileLabel(tile);
    labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
  }

  const dominantLabel = [...labelCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'outer edge';
  const topLayerTiles = activeTiles.filter((tile) => tile.z >= 2).length;

  let suggestedFocus = 'Смотрите на свободные края и пары на верхних слоях.';

  if (topLayerTiles > activeTiles.length * 0.22) {
    suggestedFocus = 'Сначала разберите верхний слой: он держит под собой будущие ходы.';
  } else if (availablePairs.length <= 3) {
    suggestedFocus = 'Ходов мало, поэтому берите только те пары, которые гарантированно раскрывают поле.';
  } else if (dominantLabel.includes('bamboo') || dominantLabel.includes('dots')) {
    suggestedFocus = `Сейчас чаще всего встречается ${dominantLabel}. Это хороший безопасный фокус для следующего хода.`;
  }

  return {
    tilesLeft: activeTiles.length,
    freeTiles: freeTiles.length,
    availablePairs: availablePairs.length,
    topLayerTiles,
    dominantLabel,
    suggestedFocus,
  };
}

export function boardSnapshotLabel(context: CoachContext) {
  if (context.availablePairs <= 2) {
    return 'Поле под давлением';
  }

  if (context.topLayerTiles > context.tilesLeft * 0.2) {
    return 'Плотный верхний слой';
  }

  if (context.freeTiles > 18) {
    return 'Много тактических ходов';
  }

  return 'Сбалансированный ритм';
}

export function buildCoachPlan(activeTiles: TileInstance[]): CoachPlan {
  const { freeTiles, pairs } = getAvailablePairs(activeTiles);
  const context = buildCoachContext(activeTiles, freeTiles, pairs);
  const suggestedMoves = pairs
    .map((pair) => scoreMove(pair, activeTiles, context))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  let summary = 'Пока лучше играть от безопасных открытых пар и не трогать хаотичные ходы в центре.';

  if (pairs.length === 0) {
    summary = 'Открытых пар не осталось. Здесь уже нужен откат хода или новая сдача.';
  } else if (context.topLayerTiles > activeTiles.length * 0.22) {
    summary = 'Главная задача сейчас не просто снять пару, а распечатать верхнюю часть расклада.';
  } else if (pairs.length >= 7) {
    summary = 'Ходов достаточно, поэтому можно выбирать пары, которые открывают края и не сужают поле.';
  } else if (context.availablePairs <= 3) {
    summary = 'Ходов мало, поэтому каждый выбор должен раскрывать следующий уровень или внешний край.';
  }

  return {
    snapshotLabel: boardSnapshotLabel(context),
    summary,
    focus: context.suggestedFocus,
    freeTiles: freeTiles.length,
    availablePairs: pairs.length,
    suggestedMoves,
  };
}
