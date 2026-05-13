import { TileInstance, TilePos, TileType, LAYOUT_TURTLE } from './types';

export function isTileFree(tile: TilePos, allTiles: TilePos[]): boolean {
  // A tile is free if:
  // 1. No tile is on top of it (z+1) covering any part of its 2x2 area.
  // 2. Its left OR right side is free.
  
  const topBlocked = allTiles.some(t => 
    t.z === tile.z + 1 && 
    Math.abs(t.x - tile.x) < 2 && 
    Math.abs(t.y - tile.y) < 2
  );
  if (topBlocked) return false;

  const leftBlocked = allTiles.some(t => 
    t.z === tile.z && 
    t.x === tile.x - 2 && 
    Math.abs(t.y - tile.y) < 2
  );
  const rightBlocked = allTiles.some(t => 
    t.z === tile.z && 
    t.x === tile.x + 2 && 
    Math.abs(t.y - tile.y) < 2
  );

  return !leftBlocked || !rightBlocked;
}

// Simple seeded random generator
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export function generateSolvableBoard(layout: TilePos[], seed?: number): TileInstance[] {
  const rng = seed !== undefined ? new SeededRandom(seed) : null;
  const random = () => rng ? rng.next() : Math.random();

  const positions = [...layout];
  if (positions.length % 2 !== 0) {
    positions.pop();
  }

  // Standard Tile Set
  const tilePool: TileType[] = [];
  
  ['bamboo', 'dot', 'character'].forEach(suit => {
    for (let v = 1; v <= 9; v++) {
      for (let i = 0; i < 4; i++) tilePool.push({ category: 'suit', suit: suit as any, value: v });
    }
  });
  
  ['east', 'south', 'west', 'north'].forEach(d => {
    for (let i = 0; i < 4; i++) tilePool.push({ category: 'wind', direction: d as any });
  });

  ['red', 'green', 'white'].forEach(c => {
    for (let i = 0; i < 4; i++) tilePool.push({ category: 'dragon', color: c as any });
  });

  for (let i = 1; i <= 4; i++) {
    tilePool.push({ category: 'season', type: i });
    tilePool.push({ category: 'flower', type: i });
  }
  
  const result: TileInstance[] = [];
  const remainingPositions = [...positions];
  const shuffledPool = tilePool.sort(() => (random() - 0.5));

  while (remainingPositions.length > 0) {
    const freePositions = remainingPositions.filter(p => isTileFree(p, remainingPositions));
    
    if (freePositions.length < 2) break;

    const p1Idx = Math.floor(random() * freePositions.length);
    let p2Idx = Math.floor(random() * (freePositions.length - 1));
    if (p2Idx >= p1Idx) p2Idx++;
    
    const p1 = freePositions[p1Idx];
    const p2 = freePositions[p2Idx];

    const type = shuffledPool.pop()!;
    let typePair = type;
    
    // Flowers and Seasons match any within category
    if (type.category === 'flower' || type.category === 'season') {
       typePair = shuffledPool.find(t => t.category === type.category)!;
       const pairIdx = shuffledPool.indexOf(typePair);
       shuffledPool.splice(pairIdx, 1);
    } else {
       // Find the exact matching type in the pool
       const matchingIdx = shuffledPool.findIndex(t => areTilesMatching({ type } as any, { type: t } as any));
       if (matchingIdx !== -1) {
          typePair = shuffledPool.splice(matchingIdx, 1)[0];
       }
    }
    
    result.push({ ...p1, id: `t-${remainingPositions.length}-1`, type, isRemoved: false });
    result.push({ ...p2, id: `t-${remainingPositions.length}-2`, type: typePair, isRemoved: false });

    const idx1 = remainingPositions.indexOf(p1);
    remainingPositions.splice(idx1, 1);
    const idx2 = remainingPositions.indexOf(p2);
    remainingPositions.splice(idx2, 1);
  }

  return result;
}

export function areTilesMatching(t1: TileInstance, t2: TileInstance): boolean {
  if (t1.type.category !== t2.type.category) return false;
  
  const type1 = t1.type;
  const type2 = t2.type;

  if (type1.category === 'suit' && type2.category === 'suit') {
    return type1.suit === type2.suit && type1.value === type2.value;
  }
  if (type1.category === 'wind' && type2.category === 'wind') {
    return type1.direction === type2.direction;
  }
  if (type1.category === 'dragon' && type2.category === 'dragon') {
    return type1.color === type2.color;
  }
  if (type1.category === 'season' || type1.category === 'flower') {
    return true;
  }
  return false;
}
