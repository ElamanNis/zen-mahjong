export type TileType = 
  | { category: 'suit', suit: 'bamboo' | 'dot' | 'character', value: number }
  | { category: 'wind', direction: 'east' | 'south' | 'west' | 'north' }
  | { category: 'dragon', color: 'red' | 'green' | 'white' }
  | { category: 'season', type: number }
  | { category: 'flower', type: number };

export interface TilePos {
  x: number;
  y: number;
  z: number;
}

export interface TileInstance extends TilePos {
  id: string;
  type: TileType;
  isRemoved: boolean;
}

export const TILE_WIDTH = 2;
export const TILE_HEIGHT = 2;
export const TILE_DEPTH = 1;

export const LAYOUT_TURTLE: TilePos[] = [
  // Layer 0 (Bottom) - 82 tiles roughly
  // Constructing a classic turtle shape...
  ...generateTurtleLayer0(),
  ...generateTurtleLayer1(),
  ...generateTurtleLayer2(),
  ...generateTurtleLayer3(),
  ...generateTurtleLayer4(),
];

function generateTurtleLayer0(): TilePos[] {
  const positions: TilePos[] = [];
  // Central block 12x8 (using 2x2 coordinate units)
  // We'll use absolute coordinates. Tiles are 2x2.
  for (let y = 1; y <= 7; y++) {
    for (let x = 3; x <= 14; x++) {
      if (y === 1 || y === 7) {
         if (x >= 5 && x <= 12) positions.push({ x, y: y * 2, z: 0 });
      } else if (y === 2 || y === 6) {
         if (x >= 4 && x <= 13) positions.push({ x, y: y * 2, z: 0 });
      } else {
         positions.push({ x, y: y * 2, z: 0 });
      }
    }
  }
  // The 'wings'
  positions.push({ x: 1, y: 8, z: 0 }); // Left single
  positions.push({ x: 15, y: 8, z: 0 }); // Right single
  positions.push({ x: 16, y: 8, z: 0 }); // Right second
  return positions;
}

function generateTurtleLayer1(): TilePos[] {
  const positions: TilePos[] = [];
  // 6x10 block centered
  for (let y = 2; y <= 6; y++) {
    for (let x = 5; x <= 12; x++) {
      positions.push({ x: x + 0.5, y: y * 2 + 1, z: 1 }); // Offset by 0.5 to center on the 2x2 grid below? 
      // Actually standard layouts often use half-offsets.
    }
  }
  return positions.slice(0, 38); // Adjust to standard count
}

function generateTurtleLayer2(): TilePos[] {
    const positions: TilePos[] = [];
    for (let y = 3; y <= 5; y++) {
      for (let x = 7; x <= 10; x++) {
        positions.push({ x: x + 1, y: y * 2 + 2, z: 2 });
      }
    }
    return positions.slice(0, 18);
}

function generateTurtleLayer3(): TilePos[] {
    return [
        { x: 8, y: 8, z: 3 },
        { x: 10, y: 8, z: 3 },
        { x: 8, y: 10, z: 3 },
        { x: 10, y: 10, z: 3 },
    ];
}

function generateTurtleLayer4(): TilePos[] {
    return [{ x: 9, y: 9, z: 4 }];
}
