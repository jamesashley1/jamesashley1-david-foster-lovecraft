
export type EntityType = 'player' | 'monster' | 'item' | 'npc' | 'wall' | 'floor' | 'stairs' | 'lore' | 'environment';

export interface Position {
  x: number;
  y: number;
}

export interface Stats {
  hp: number;
  maxHp: number;
  sanity: number;
  maxSanity: number;
  attack: number;
  defense: number;
  resistances?: {
    physical?: number; // 0 to 1 multiplier
    magic?: number;
  };
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  pos: Position;
  char: string;
  color: string;
  stats?: Stats;
  description?: string;
  inventory?: Item[];
  dialogue?: string[];
  loreId?: string;
  effect?: (stats: Stats) => Stats;
  ability?: 'teleport' | 'drain_sanity' | 'ranged_attack' | 'split';
  lootTable?: { itemTemplate: Partial<Entity>, chance: number }[];
  itemType?: 'weapon' | 'consumable' | 'artifact';
  minLevel?: number;
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  quote: string;
  author?: string;
}

export interface Item {
  id: string;
  name: string;
  itemType: 'weapon' | 'consumable' | 'artifact';
  effect?: (stats: Stats) => Stats;
  description: string;
  isEquipped?: boolean;
}

export interface Room {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  description: string;
  visited: boolean;
}

export interface Theme {
  id: string;
  name: string;
  introLog: string;
  monsterNames: string[]; // Names of monsters that appear in this theme
  environmentalDetails: Partial<Entity>[];
  roomDescriptions: string[];
}

export interface GameState {
  player: Entity;
  entities: Entity[];
  level: number;
  grid: EntityType[][];
  rooms: Room[];
  currentRoomIndex: number | null;
  currentTheme?: Theme | null;
  width: number;
  height: number;
  logs: string[];
  isGameOver: boolean;
  turn: number;
  discoveredLore: string[]; // IDs of discovered lore
  lastAction?: string;
  actionCount: number;
  explored: boolean[][];
}
