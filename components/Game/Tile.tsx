import { memo } from 'react';
import { TileInstance, TILE_WIDTH, TILE_HEIGHT } from '@/lib/mahjong/types';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/hooks/use-game-store';
import useSound from 'use-sound';
import { 
  Trees, 
  Circle, 
  Compass, 
  Flame, 
  Flower2, 
  CloudSun 
} from 'lucide-react';

interface TileProps {
  tile: TileInstance;
  isFree: boolean;
  isSelected: boolean;
  isHinted: boolean;
  onClick: (id: string) => void;
}

export const Tile = memo(function Tile({ tile, isFree, isSelected, isHinted, onClick }: TileProps) {
  const skin = useGameStore(s => s.skin);
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });

  const getIcon = () => {
    const { type } = tile;
    
    // Theme colors
    const colors = {
      zen: { bamboo: 'text-emerald-600', dot: 'text-blue-600', wind: 'text-slate-700', dragon: 'text-red-500', flower: 'text-fuchsia-500', season: 'text-orange-500' },
      neon: { bamboo: 'text-cyan-400', dot: 'text-pink-500', wind: 'text-indigo-400', dragon: 'text-yellow-400', flower: 'text-purple-400', season: 'text-green-400' },
      nature: { bamboo: 'text-green-700', dot: 'text-sky-600', wind: 'text-stone-600', dragon: 'text-orange-600', flower: 'text-rose-500', season: 'text-amber-500' },
    }[skin];

    if (type.category === 'suit') {
      if (type.suit === 'bamboo') return <Trees className={cn("w-5 h-5", colors.bamboo)} />;
      if (type.suit === 'dot') return <Circle className={cn("w-5 h-5 fill-current", colors.dot)} />;
      if (type.suit === 'character') return <span className={cn("text-xl font-bold font-display leading-none", colors.dragon)}>{type.value}</span>;
    }
    if (type.category === 'wind') return <Compass className={cn("w-5 h-5", colors.wind)} />;
    if (type.category === 'dragon') return <Flame className={cn("w-5 h-5", type.color === 'red' ? colors.dragon : type.color === 'green' ? colors.bamboo : 'text-slate-400')} />;
    if (type.category === 'flower') return <Flower2 className={cn("w-5 h-5", colors.flower)} />;
    if (type.category === 'season') return <CloudSun className={cn("w-5 h-5", colors.season)} />;
    return null;
  };

  const SCALE = 34;
  const x = tile.x * SCALE;
  const y = tile.y * SCALE;
  const z = tile.z * 10;

  // Theme-specific styles
  const themeStyles = {
    zen: "bg-white border-slate-200 text-slate-800 shadow-sm",
    neon: "bg-slate-900 border-indigo-500/50 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.3)]",
    nature: "bg-stone-50 border-stone-300 text-stone-800 shadow-sm",
  }[skin];

  const sideStyles = {
    zen: "bg-slate-300",
    neon: "bg-indigo-900 shadow-[0_0_10px_rgba(99,102,241,0.4)]",
    nature: "bg-stone-400",
  }[skin];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: tile.isRemoved ? 0 : 1,
        scale: tile.isRemoved ? 1.2 : 1,
        x,
        y: y - z,
        zIndex: 10 + tile.z * 10,
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'absolute',
        width: TILE_WIDTH * SCALE - 2,
        height: TILE_HEIGHT * SCALE - 2,
      }}
      className={cn(
        "cursor-pointer group",
        tile.isRemoved && "pointer-events-none"
      )}
      onClick={() => {
        if (isFree) {
          playClick();
          onClick(tile.id);
        }
      }}
    >
      {/* 3D Sides */}
      <div className={cn("absolute inset-x-0 -bottom-1.5 translate-x-1 h-full rounded-md", sideStyles)} />
      <div className={cn("absolute inset-y-0 -right-1 translate-y-1 w-full rounded-md opacity-80", sideStyles)} />
      
      {/* Main Face */}
      <div className={cn(
        "relative w-full h-full rounded-md border-t border-l flex items-center justify-center transition-all duration-200",
        themeStyles,
        isSelected && "ring-2 ring-orange-400 ring-offset-2 ring-offset-slate-950 -translate-y-1",
        isHinted && "ring-2 ring-emerald-400 animate-pulse",
        !isFree && "opacity-60 grayscale-[0.3] cursor-not-allowed",
        isFree && "hover:-translate-y-1 hover:shadow-xl",
        "flex flex-col gap-1"
      )}>
        {getIcon()}
        {tile.type.category === 'suit' && (tile.type as any).suit !== 'character' && (
           <span className="text-[10px] font-mono opacity-50">{(tile.type as any).value}</span>
        )}
      </div>
    </motion.div>
  );
});
