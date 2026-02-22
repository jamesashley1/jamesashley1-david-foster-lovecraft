import { Entity, Stats } from './types';

const ADJECTIVES = [
  'Foul', 'Rotting', 'Eldritch', 'Ancient', 'Cursed', 'Vile', 'Twisted', 'Malformed', 'Hideous', 'Unspeakable',
  'Cyclopean', 'Non-Euclidean', 'Gibbering', 'Shambling', 'Lurking', 'Creeping', 'Crawling', 'Slithering', 'Oozing', 'Pulsating'
];

const BASE_MONSTERS: Partial<Entity>[] = [
  { name: 'Rat', char: 'r', color: '#a8a29e', stats: { hp: 5, maxHp: 5, sanity: 0, maxSanity: 0, attack: 2, defense: 0 }, minLevel: 1 },
  { name: 'Bat', char: 'b', color: '#78716c', stats: { hp: 4, maxHp: 4, sanity: 0, maxSanity: 0, attack: 2, defense: 0 }, minLevel: 1 },
  { name: 'Spider', char: 's', color: '#44403c', stats: { hp: 6, maxHp: 6, sanity: 0, maxSanity: 0, attack: 3, defense: 0 }, minLevel: 1 },
  { name: 'Cultist Initiate', char: 'c', color: '#ef4444', stats: { hp: 8, maxHp: 8, sanity: 0, maxSanity: 0, attack: 3, defense: 0 }, minLevel: 2 },
  { name: 'Zombie', char: 'z', color: '#84cc16', stats: { hp: 10, maxHp: 10, sanity: 0, maxSanity: 0, attack: 3, defense: 1 }, minLevel: 2 },
  { name: 'Ghoul', char: 'g', color: '#16a34a', stats: { hp: 12, maxHp: 12, sanity: 0, maxSanity: 0, attack: 4, defense: 1 }, minLevel: 3 },
  { name: 'Deep One Scout', char: 'D', color: '#3b82f6', stats: { hp: 14, maxHp: 14, sanity: 0, maxSanity: 0, attack: 4, defense: 1 }, minLevel: 3 },
  { name: 'Slime', char: 'S', color: '#22c55e', stats: { hp: 15, maxHp: 15, sanity: 0, maxSanity: 0, attack: 3, defense: 2 }, minLevel: 3 },
  { name: 'Ghost', char: 'G', color: '#e5e7eb', stats: { hp: 8, maxHp: 8, sanity: 0, maxSanity: 0, attack: 4, defense: 3 }, minLevel: 4 },
  { name: 'Skeleton', char: 'k', color: '#f5f5f4', stats: { hp: 10, maxHp: 10, sanity: 0, maxSanity: 0, attack: 4, defense: 1 }, minLevel: 4 },
  { name: 'Cultist Acolyte', char: 'C', color: '#dc2626', stats: { hp: 16, maxHp: 16, sanity: 0, maxSanity: 0, attack: 5, defense: 1 }, minLevel: 5 },
  { name: 'Deep One Warrior', char: 'D', color: '#2563eb', stats: { hp: 20, maxHp: 20, sanity: 0, maxSanity: 0, attack: 6, defense: 2 }, minLevel: 5 },
  { name: 'Mi-Go Drone', char: 'M', color: '#ec4899', stats: { hp: 18, maxHp: 18, sanity: 0, maxSanity: 0, attack: 6, defense: 1 }, minLevel: 6 },
  { name: 'Byakhee', char: 'B', color: '#a855f7', stats: { hp: 22, maxHp: 22, sanity: 0, maxSanity: 0, attack: 7, defense: 1 }, minLevel: 6 },
  { name: 'Nightgaunt', char: 'N', color: '#6366f1', stats: { hp: 25, maxHp: 25, sanity: 0, maxSanity: 0, attack: 8, defense: 2 }, minLevel: 7 },
  { name: 'Hunting Horror', char: 'H', color: '#d946ef', stats: { hp: 30, maxHp: 30, sanity: 0, maxSanity: 0, attack: 9, defense: 2 }, minLevel: 8 },
  { name: 'Shoggoth Spawn', char: 's', color: '#10b981', stats: { hp: 35, maxHp: 35, sanity: 0, maxSanity: 0, attack: 8, defense: 3 }, minLevel: 9 },
  { name: 'Star Spawn', char: 'S', color: '#059669', stats: { hp: 40, maxHp: 40, sanity: 0, maxSanity: 0, attack: 10, defense: 4 }, minLevel: 10 },
  { name: 'Dark Young', char: 'Y', color: '#15803d', stats: { hp: 45, maxHp: 45, sanity: 0, maxSanity: 0, attack: 11, defense: 4 }, minLevel: 11 },
  { name: 'Dimensional Shambler', char: 'D', color: '#fb923c', stats: { hp: 32, maxHp: 32, sanity: 0, maxSanity: 0, attack: 9, defense: 2 }, minLevel: 12 },
  { name: 'Formless Spawn', char: 'F', color: '#000000', stats: { hp: 38, maxHp: 38, sanity: 0, maxSanity: 0, attack: 10, defense: 5 }, minLevel: 13 },
  { name: 'Gug', char: 'G', color: '#b91c1c', stats: { hp: 50, maxHp: 50, sanity: 0, maxSanity: 0, attack: 12, defense: 3 }, minLevel: 14 },
  { name: 'Ghast', char: 'g', color: '#fca5a5', stats: { hp: 28, maxHp: 28, sanity: 0, maxSanity: 0, attack: 8, defense: 1 }, minLevel: 15 },
  { name: 'Moon-Beast', char: 'M', color: '#e2e8f0', stats: { hp: 42, maxHp: 42, sanity: 0, maxSanity: 0, attack: 11, defense: 3 }, minLevel: 16 },
  { name: 'Shantak', char: 'S', color: '#9333ea', stats: { hp: 48, maxHp: 48, sanity: 0, maxSanity: 0, attack: 13, defense: 3 }, minLevel: 17 },
  { name: 'Tcho-Tcho', char: 't', color: '#f87171', stats: { hp: 25, maxHp: 25, sanity: 0, maxSanity: 0, attack: 9, defense: 1 }, minLevel: 18 },
  { name: 'Serpent Person', char: 'S', color: '#14b8a6', stats: { hp: 35, maxHp: 35, sanity: 0, maxSanity: 0, attack: 10, defense: 4 }, minLevel: 19 },
  { name: 'Yithian', char: 'Y', color: '#fbbf24', stats: { hp: 55, maxHp: 55, sanity: 0, maxSanity: 0, attack: 14, defense: 5 }, minLevel: 20 },
  { name: 'Elder Thing', char: 'E', color: '#84cc16', stats: { hp: 60, maxHp: 60, sanity: 0, maxSanity: 0, attack: 15, defense: 6 }, minLevel: 21 },
  { name: 'Flying Polyp', char: 'P', color: '#a1a1aa', stats: { hp: 65, maxHp: 65, sanity: 0, maxSanity: 0, attack: 16, defense: 6 }, minLevel: 22 },
  { name: 'Hound of Tindalos', char: 'H', color: '#7c3aed', stats: { hp: 70, maxHp: 70, sanity: 0, maxSanity: 0, attack: 18, defense: 7 }, minLevel: 23 }
];

export const ADDITIONAL_MONSTERS: Partial<Entity>[] = [];

// Generate variations
for (let i = 0; i < 100; i++) {
  const base = BASE_MONSTERS[Math.floor(Math.random() * BASE_MONSTERS.length)];
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  
  const levelModifier = Math.floor(Math.random() * 5); // 0 to 4
  const minLevel = (base.minLevel || 1) + levelModifier;
  
  const hp = Math.floor((base.stats?.hp || 10) * (1 + levelModifier * 0.2));
  const attack = Math.floor((base.stats?.attack || 2) * (1 + levelModifier * 0.15));
  const defense = Math.floor((base.stats?.defense || 0) + levelModifier * 0.5);

  ADDITIONAL_MONSTERS.push({
    ...base,
    name: `${adjective} ${base.name}`,
    minLevel,
    stats: {
      ...base.stats!,
      hp,
      maxHp: hp,
      attack,
      defense
    },
    description: `A ${adjective.toLowerCase()} variant of the ${base.name}. It looks significantly more dangerous than its common counterpart.`
  });
}
