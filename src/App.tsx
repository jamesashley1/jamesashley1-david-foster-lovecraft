/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, 
  Heart, 
  Brain, 
  Sword, 
  Shield, 
  Scroll, 
  Map as MapIcon,
  ChevronRight,
  AlertCircle,
  Info,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Entity, GameState, Position, EntityType, LoreEntry, Item, Room, Theme } from './types';
import { generateLevel, getRandomFloorPos, getRandomRoomPos } from './procgen';
import { MONSTERS, ITEMS, NPCS, LORE_ENTRIES, ENVIRONMENTAL_DETAILS } from './data';
import { ADDITIONAL_MONSTERS } from './monsters';
import { ADDITIONAL_LORE } from './additional_lore';
import { ADDITIONAL_NPCS } from './additional_npcs';
import { THEMES } from './themes';
import { ROOM_DESCRIPTIONS, COMBAT_LOGS } from './descriptions';
import { ALTAR_DESCRIPTIONS, CARVING_DESCRIPTIONS } from './environmental_descriptions';
import { STAIR_DESCRIPTIONS } from './stair_descriptions';
import { SANITY_DRAIN_LOGS, SANITY_LOSS_LOGS, LOOT_DROP_LOGS, LOW_HEALTH_LOGS, LOW_SANITY_LOGS } from './status_logs';
import { META_COMMENTARY } from './meta_commentary';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GRID_WIDTH = 40;
const GRID_HEIGHT = 25;
const TILE_SIZE = 24;

const DPad = ({ onMove }: { onMove: (dx: number, dy: number) => void }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-48 h-48 mx-auto mt-8 lg:hidden">
      <div />
      <button 
        type="button"
        className="bg-stone-800/50 border border-stone-700 rounded-xl flex items-center justify-center active:bg-emerald-500/20 active:scale-95 transition-all"
        onClick={() => onMove(0, -1)}
      >
        <ChevronRight className="w-8 h-8 -rotate-90 text-stone-400" />
      </button>
      <div />
      
      <button 
        type="button"
        className="bg-stone-800/50 border border-stone-700 rounded-xl flex items-center justify-center active:bg-emerald-500/20 active:scale-95 transition-all"
        onClick={() => onMove(-1, 0)}
      >
        <ChevronRight className="w-8 h-8 rotate-180 text-stone-400" />
      </button>
      <button 
        type="button"
        className="bg-stone-800/50 border border-stone-700 rounded-xl flex items-center justify-center active:bg-emerald-500/20 active:scale-95 transition-all"
        onClick={() => onMove(0, 1)}
      >
        <ChevronRight className="w-8 h-8 rotate-90 text-stone-400" />
      </button>
      <button 
        type="button"
        className="bg-stone-800/50 border border-stone-700 rounded-xl flex items-center justify-center active:bg-emerald-500/20 active:scale-95 transition-all"
        onClick={() => onMove(1, 0)}
      >
        <ChevronRight className="w-8 h-8 text-stone-400" />
      </button>
      
      <div />
      <div />
      <div />
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [activeLore, setActiveLore] = useState<LoreEntry | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<{ npc: Entity, text: string } | null>(null);
  const [activeStairs, setActiveStairs] = useState<{ description: string } | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [playerAttackDir, setPlayerAttackDir] = useState<{ dx: number, dy: number } | null>(null);
  const [monsterAttack, setMonsterAttack] = useState<{ id: string, dx: number, dy: number } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const hasLineOfSight = (x0: number, y0: number, x1: number, y1: number, grid: EntityType[][]) => {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    
    let x = x0;
    let y = y0;
    
    while (true) {
      if (x === x1 && y === y1) return true;
      if (grid[y][x] === 'wall') return false;
      
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
  };

  const getVisibleTiles = (grid: EntityType[][], playerPos: Position, radius: number = 8) => {
    const visible = new Set<string>();
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const targetX = playerPos.x + x;
        const targetY = playerPos.y + y;
        
        if (targetX >= 0 && targetX < GRID_WIDTH && targetY >= 0 && targetY < GRID_HEIGHT) {
          const dist = Math.sqrt(x*x + y*y);
          if (dist <= radius) {
            if (hasLineOfSight(playerPos.x, playerPos.y, targetX, targetY, grid)) {
              visible.add(`${targetX},${targetY}`);
            }
          }
        }
      }
    }
    return visible;
  };

  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(null as any), 200);
  };

  const playAttackSound = (monsterName?: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // Default player sound
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      if (monsterName) {
        switch (monsterName) {
          case 'Deep One':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(80, audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(120, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            break;
          case 'Mi-Go':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            break;
          case 'Cultist':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            break;
          case 'Shoggoth':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(40, audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(60, audioCtx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            break;
          case 'Night-Gaunt':
            oscillator.type = 'sine'; // Will sound like a whoosh with fast ramp
            oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            break;
          case 'Elder Thing':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
            // Add some "fluting" vibrato
            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            lfo.frequency.value = 20;
            lfoGain.gain.value = 50;
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            lfo.start();
            lfo.stop(audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            break;
          case 'Flying Polyp':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            break;
          case 'Hounds of Tindalos':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(300, audioCtx.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            break;
        }
      }

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.error("Audio failed", e);
    }
  };

  const addLog = (msg: string) => {
    setGameState(prev => prev ? { ...prev, logs: [...prev.logs.slice(-50), msg] } : null);
  };

  const PHILOSOPHICAL_INSIGHTS = [
    "The act of moving is, when you really sit with it, a profound statement on the illusion of progress in a closed system.",
    "You are currently engaged in a cycle of stimulus and response that effectively bypasses the higher functions of the prefrontal cortex.",
    "The repetitive nature of your current trajectory suggests a certain comfort in the predictable, even when the predictable involves being eaten by a sentient lava lamp.",
    "One wonders if the Investigator is aware that their entire existence is predicated on a series of discrete, grid-based decisions.",
    "The sound of your own footsteps is starting to take on a rhythmic quality, as if you are chanting a prayer to the god of Incremental Gains.",
    "There is a specific kind of loneliness in a hallway that exists only to connect two rooms you don't actually want to be in.",
    "The monster doesn't hate you; it merely lacks the cognitive equipment to recognize you as anything other than a source of metabolic potential.",
    "Every turn taken is a turn closer to the heat death of the universe, or at least the end of your current battery life."
  ];

  const handleRepetition = (action: string) => {
    setGameState(prev => {
      if (!prev) return null;
      const isSameAction = prev.lastAction === action;
      const newCount = isSameAction ? prev.actionCount + 1 : 0;
      
      let newLogs = [...prev.logs];
      if (newCount >= 5) {
        const insight = PHILOSOPHICAL_INSIGHTS[Math.floor(Math.random() * PHILOSOPHICAL_INSIGHTS.length)];
        newLogs.push(`[META-COMMENTARY]: ${insight}`);
        return { ...prev, logs: newLogs.slice(-50), lastAction: action, actionCount: 0 };
      }
      
      return { ...prev, lastAction: action, actionCount: newCount };
    });
  };

  const initGame = useCallback(() => {
    const isThemed = Math.random() < 0.2;
    const currentTheme = isThemed ? THEMES[Math.floor(Math.random() * THEMES.length)] : null;

    const { grid, rooms: rawRooms } = generateLevel(GRID_WIDTH, GRID_HEIGHT, 1);
    const rooms: Room[] = rawRooms.map((r, i) => ({
      ...r,
      id: `room-${i}`,
      description: currentTheme 
        ? (Math.random() > 0.5 ? currentTheme.roomDescriptions[Math.floor(Math.random() * currentTheme.roomDescriptions.length)] : ROOM_DESCRIPTIONS[Math.floor(Math.random() * ROOM_DESCRIPTIONS.length)])
        : ROOM_DESCRIPTIONS[Math.floor(Math.random() * ROOM_DESCRIPTIONS.length)],
      visited: false
    }));

    const playerPos = { 
      x: Math.floor(rooms[0].x + rooms[0].w / 2), 
      y: Math.floor(rooms[0].y + rooms[0].h / 2) 
    };

    const player: Entity = {
      id: 'player',
      type: 'player',
      name: 'Investigator',
      pos: playerPos,
      char: '@',
      color: '#ffffff',
      stats: { hp: 30, maxHp: 30, sanity: 50, maxSanity: 50, attack: 5, defense: 2 },
      inventory: []
    };

    const entities: Entity[] = [];
    
    // Spawn monsters
    const allMonsters = [...MONSTERS, ...ADDITIONAL_MONSTERS];
    let levelMonsters = allMonsters.filter(m => (m.minLevel || 1) <= 1);
    
    if (currentTheme) {
      const themeMonsters = allMonsters.filter(m => currentTheme.monsterNames.includes(m.name!));
      if (themeMonsters.length > 0) {
        // Mix theme monsters with level monsters, but prioritize theme
        levelMonsters = [...themeMonsters, ...themeMonsters, ...levelMonsters]; 
      }
    }

    for (let i = 0; i < 5; i++) {
      const pos = getRandomFloorPos(grid);
      const template = levelMonsters[Math.floor(Math.random() * levelMonsters.length)] || MONSTERS[0];
      entities.push({
        ...template,
        id: `monster-${i}`,
        type: 'monster',
        pos,
      } as Entity);
    }

    // Spawn items
    for (let i = 0; i < 3; i++) {
      const pos = getRandomFloorPos(grid);
      const template = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      entities.push({
        ...template,
        id: `item-${i}`,
        type: 'item',
        pos,
      } as Entity);
    }

    // Spawn Lore (Less frequent)
    const allLore = [...LORE_ENTRIES, ...ADDITIONAL_LORE];
    if (Math.random() > 0.6) { // 40% chance of 1 tome
      const pos = getRandomFloorPos(grid);
      const lore = allLore[Math.floor(Math.random() * allLore.length)];
      entities.push({
        id: `lore-0`,
        type: 'lore',
        name: 'Ancient Tome',
        char: '?',
        color: '#fbbf24',
        pos,
        loreId: lore.id,
        description: 'A dusty, leather-bound book filled with cryptic writing.'
      });
    }

    // Spawn NPCs
    if (Math.random() > 0.5) {
      const pos = getRandomRoomPos(rawRooms);
      const allNpcs = [...NPCS, ...ADDITIONAL_NPCS];
      const npcTemplate = allNpcs[Math.floor(Math.random() * allNpcs.length)];
      entities.push({
        ...npcTemplate,
        id: `npc-${Date.now()}`,
        type: 'npc',
        pos
      } as Entity);
    }

      // Spawn Environmental Details
      for (let i = 0; i < 3; i++) {
        const pos = getRandomFloorPos(grid);
        let envTemplate = currentTheme 
          ? (Math.random() > 0.3 ? currentTheme.environmentalDetails[Math.floor(Math.random() * currentTheme.environmentalDetails.length)] : ENVIRONMENTAL_DETAILS[Math.floor(Math.random() * ENVIRONMENTAL_DETAILS.length)])
          : ENVIRONMENTAL_DETAILS[Math.floor(Math.random() * ENVIRONMENTAL_DETAILS.length)];
        
        // Apply unique descriptions for altars and carvings
        if (envTemplate.name === 'Blood-Stained Altar') {
           envTemplate = { ...envTemplate, description: ALTAR_DESCRIPTIONS[Math.floor(Math.random() * ALTAR_DESCRIPTIONS.length)] };
        } else if (envTemplate.name === 'Strange Carvings') {
           envTemplate = { ...envTemplate, description: CARVING_DESCRIPTIONS[Math.floor(Math.random() * CARVING_DESCRIPTIONS.length)] };
        }

        entities.push({
          ...envTemplate,
          id: `env-${i}`,
          type: 'environment',
          pos
        } as Entity);
      }

    const initialExplored = Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(false));
    const visible = getVisibleTiles(grid, playerPos);
    visible.forEach(key => {
      const [x, y] = key.split(',').map(Number);
      initialExplored[y][x] = true;
    });

    const initialLogs = ['You arrive at the Miskatonic basement. The air is thick with a specific, highly localized dread that suggests your life insurance policy is about to become relevant.'];
    if (currentTheme) {
      initialLogs.push(`[THEME]: ${currentTheme.introLog}`);
    }

    setGameState({
      player,
      entities,
      level: 1,
      grid,
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
      logs: initialLogs,
      isGameOver: false,
      turn: 0,
      discoveredLore: [],
      actionCount: 0,
      explored: initialExplored,
      rooms,
      currentRoomIndex: 0,
      currentTheme
    });
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState?.logs]);

  const movePlayer = (dx: number, dy: number) => {
    if (!gameState || gameState.isGameOver || activeLore || activeDialogue) return;

    handleRepetition(`move-${dx}-${dy}`);

    const newPos = { x: gameState.player.pos.x + dx, y: gameState.player.pos.y + dy };
    
    // Bounds check
    if (newPos.x < 0 || newPos.x >= GRID_WIDTH || newPos.y < 0 || newPos.y >= GRID_HEIGHT) return;

    // Wall check
    if (gameState.grid[newPos.y][newPos.x] === 'wall') return;

    // Entity check
    const targetEntity = gameState.entities.find(e => e.pos.x === newPos.x && e.pos.y === newPos.y);
    
    if (targetEntity) {
      if (targetEntity.type === 'monster') {
        setPlayerAttackDir({ dx, dy });
        setTimeout(() => setPlayerAttackDir(null), 150);
        attack(gameState.player, targetEntity);
        endTurn();
        return;
      } else if (targetEntity.type === 'item') {
        addLog(`You picked up ${targetEntity.name}.`);
        setGameState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            player: {
              ...prev.player,
              inventory: [...(prev.player.inventory || []), {
                id: targetEntity.id,
                name: targetEntity.name,
                itemType: targetEntity.itemType as any,
                effect: targetEntity.effect,
                description: targetEntity.description || '',
                isEquipped: false
              }]
            },
            entities: prev.entities.filter(e => e.id !== targetEntity.id)
          };
        });
      } else if (targetEntity.type === 'lore') {
        const allLore = [...LORE_ENTRIES, ...ADDITIONAL_LORE];
        const lore = allLore.find(l => l.id === targetEntity.loreId);
        if (lore) {
          setActiveLore(lore);
          addLog(`You discovered: ${lore.title}`);
          addLog(`"${lore.quote}"`);
          setGameState(prev => {
            if (!prev) return null;
            return {
              ...prev,
              discoveredLore: [...prev.discoveredLore, lore.id],
              entities: prev.entities.filter(e => e.id !== targetEntity.id)
            };
          });
        }
        return;
      } else if (targetEntity.type === 'npc') {
        if (targetEntity.dialogue) {
          const text = targetEntity.dialogue[Math.floor(Math.random() * targetEntity.dialogue.length)];
          setActiveDialogue({ npc: targetEntity, text });
          addLog(`You speak with ${targetEntity.name}.`);
        }
        return;
      }
    }

    // Stairs check
    if (gameState.grid[newPos.y][newPos.x] === 'stairs') {
      const description = STAIR_DESCRIPTIONS[Math.floor(Math.random() * STAIR_DESCRIPTIONS.length)];
      setActiveStairs({ description });
      return;
    }

    setGameState(prev => {
      if (!prev) return null;
      
      const newExplored = prev.explored.map(row => [...row]);
      const visible = getVisibleTiles(prev.grid, newPos);
      visible.forEach(key => {
        const [x, y] = key.split(',').map(Number);
        newExplored[y][x] = true;
      });

      // Check room entry
      let newRoomIndex = prev.currentRoomIndex;
      let newRooms = [...prev.rooms];
      let logMsg = null;

      const roomIndex = prev.rooms.findIndex(r => 
        newPos.x >= r.x && newPos.x < r.x + r.w &&
        newPos.y >= r.y && newPos.y < r.y + r.h
      );

      if (roomIndex !== -1 && roomIndex !== prev.currentRoomIndex) {
        newRoomIndex = roomIndex;
        if (!newRooms[roomIndex].visited) {
          newRooms[roomIndex].visited = true;
          logMsg = newRooms[roomIndex].description;

          // Check for environmental details in this room
          const room = newRooms[roomIndex];
          const envDetails = prev.entities.filter(e => 
            e.type === 'environment' &&
            e.pos.x >= room.x && e.pos.x < room.x + room.w &&
            e.pos.y >= room.y && e.pos.y < room.y + room.h
          );

          if (envDetails.length > 0) {
            const detail = envDetails[0];
            logMsg += ` You notice ${detail.name.toLowerCase()}: ${detail.description}`;
          }
        }
      } else if (roomIndex === -1) {
        newRoomIndex = null; // In corridor
      }

      const nextState = {
        ...prev,
        player: { ...prev.player, pos: newPos },
        explored: newExplored,
        rooms: newRooms,
        currentRoomIndex: newRoomIndex,
        logs: logMsg ? [...prev.logs, logMsg].slice(-50) : prev.logs
      };
      
      return nextState;
    });
    endTurn();
  };

  const useItem = (item: Item) => {
    if (!gameState) return;

    if (item.itemType === 'weapon' || item.itemType === 'artifact') {
      setGameState(prev => {
        if (!prev) return null;
        const newInventory = prev.player.inventory?.map(i => {
          if (i.id === item.id) return { ...i, isEquipped: !i.isEquipped };
          // Only one weapon at a time, but multiple artifacts are okay
          if (item.itemType === 'weapon' && i.itemType === 'weapon') return { ...i, isEquipped: false };
          return i;
        });

        const isEquipping = !item.isEquipped;
        addLog(isEquipping ? `You equipped the ${item.name}.` : `You unequipped the ${item.name}.`);

        return {
          ...prev,
          player: { ...prev.player, inventory: newInventory }
        };
      });
    } else if (item.itemType === 'consumable') {
      if (item.name === 'Miskatonic Map') {
        setGameState(prev => {
          if (!prev) return null;
          const newExplored = prev.explored.map(row => row.map(() => true));
          addLog(`You read the Miskatonic Map. The layout of the floor burns itself into your mind, which is probably fine.`);
          return {
            ...prev,
            explored: newExplored,
            player: {
              ...prev.player,
              inventory: prev.player.inventory?.filter(i => i.id !== item.id)
            }
          };
        });
      } else if (item.effect) {
        setGameState(prev => {
          if (!prev) return null;
          const newStats = item.effect(prev.player.stats!);
          addLog(`You used the ${item.name}.`);
          return {
            ...prev,
            player: {
              ...prev.player,
              stats: newStats,
              inventory: prev.player.inventory?.filter(i => i.id !== item.id)
            }
          };
        });
      } else {
        addLog(`You used the ${item.name}, but nothing happened.`);
      }
    }
  };

  const getEffectiveStats = (entity: Entity) => {
    let stats = { ...entity.stats! };
    entity.inventory?.forEach(item => {
      if (item.isEquipped && item.effect) {
        stats = item.effect(stats);
      }
    });
    return stats;
  };

  const dropLoot = (monster: Entity) => {
    if (!monster.lootTable) return null;
    
    const roll = Math.random();
    let cumulativeChance = 0;
    
    for (const loot of monster.lootTable) {
      cumulativeChance += loot.chance;
      if (roll < cumulativeChance) {
        return {
          ...loot.itemTemplate,
          id: `drop-${Date.now()}-${Math.random()}`,
          type: 'item',
          pos: { ...monster.pos }
        } as Entity;
      }
    }
    return null;
  };

  const attack = (attacker: Entity, defender: Entity) => {
    if (attacker.type === 'player') {
      playAttackSound();
      handleRepetition(`attack-${defender.id}`);
    }
    
    const attackerStats = getEffectiveStats(attacker);
    const defenderStats = getEffectiveStats(defender);
    
    let damage = Math.max(1, attackerStats.attack - defenderStats.defense);
    
    // Apply resistances
    if (defenderStats.resistances?.physical) {
      damage = Math.max(1, Math.floor(damage * defenderStats.resistances.physical));
    }
    
    defender.stats!.hp -= damage;
    
    // Select random combat log
    const logTemplate = attacker.type === 'player' 
      ? COMBAT_LOGS.playerAttack[Math.floor(Math.random() * COMBAT_LOGS.playerAttack.length)]
      : COMBAT_LOGS.monsterAttack[Math.floor(Math.random() * COMBAT_LOGS.monsterAttack.length)];
    
    addLog(logTemplate(attacker.name, defender.name, damage));

    if (defender.stats.hp <= 0) {
      const defeatLog = COMBAT_LOGS.defeat[Math.floor(Math.random() * COMBAT_LOGS.defeat.length)];
      addLog(defeatLog(defender.name));
      if (defender.type === 'player') {
        setGameState(prev => prev ? { ...prev, isGameOver: true } : null);
      } else {
        const loot = dropLoot(defender);
        if (loot) {
          const lootLog = LOOT_DROP_LOGS[Math.floor(Math.random() * LOOT_DROP_LOGS.length)];
          addLog(lootLog(defender.name, loot.name));
        }
        setGameState(prev => {
          if (!prev) return null;
          const newEntities = prev.entities.filter(e => e.id !== defender.id);
          if (loot) {
            newEntities.push(loot);
          }
          return {
            ...prev,
            entities: newEntities
          };
        });
      }
    }

    // Sanity check for player
    if (attacker.type === 'player' && defender.type === 'monster') {
      const sanityLoss = Math.floor(Math.random() * 3);
      if (sanityLoss > 0) {
        attacker.stats.sanity -= sanityLoss;
        const sanityLog = SANITY_DRAIN_LOGS[Math.floor(Math.random() * SANITY_DRAIN_LOGS.length)];
        addLog(sanityLog(defender.name, sanityLoss));
        
        if (attacker.stats.sanity <= 0) {
          const lossLog = SANITY_LOSS_LOGS[Math.floor(Math.random() * SANITY_LOSS_LOGS.length)];
          addLog(lossLog);
          setGameState(prev => prev ? { ...prev, isGameOver: true } : null);
        }
      }
    }
  };

  const endTurn = () => {
    setGameState(prev => {
      if (!prev || prev.isGameOver) return prev;
      
      const newEntities = [...prev.entities];
      const newLogs = [...prev.logs];
      let playerHp = prev.player.stats!.hp;
      let playerSanity = prev.player.stats!.sanity;

      newEntities.forEach(e => {
        if (e.type === 'monster') {
          const dx = prev.player.pos.x - e.pos.x;
          const dy = prev.player.pos.y - e.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 5) { // Aggro range
            // Special Abilities Logic
            if (e.ability === 'teleport' && dist > 1.5 && Math.random() > 0.7) {
              const teleportPos = getRandomFloorPos(prev.grid);
              e.pos = teleportPos;
              newLogs.push(`${e.name} vanishes and reappears elsewhere, violating several fundamental laws of spatial continuity.`);
            } else if (e.ability === 'drain_sanity' && dist < 4) {
              playerSanity -= 2;
              newLogs.push(`The presence of the ${e.name} gnaws at your mind like a particularly articulate termite.`);
            } else if (e.ability === 'ranged_attack' && dist < 4 && dist > 1.5 && Math.random() > 0.5) {
              const damage = Math.max(1, e.stats!.attack - prev.player.stats!.defense);
              playerHp -= damage;
              triggerScreenShake();
              playAttackSound(e.name);
              setMonsterAttack({ id: e.id, dx: Math.sign(dx), dy: Math.sign(dy) });
              setTimeout(() => setMonsterAttack(null), 150);
              newLogs.push(`${e.name} blasts you with a vortex of wind for ${damage} damage. It\'s very rude.`);
            }

            if (dist <= 1.5) {
              // Attack player
              const attackerStats = getEffectiveStats(e);
              const defenderStats = getEffectiveStats(prev.player);
              let damage = Math.max(1, attackerStats.attack - defenderStats.defense);
              
              if (defenderStats.resistances?.physical) {
                damage = Math.max(1, Math.floor(damage * defenderStats.resistances.physical));
              }

              playerHp -= damage;
              triggerScreenShake();
              playAttackSound(e.name);
              setMonsterAttack({ id: e.id, dx: Math.sign(dx), dy: Math.sign(dy) });
              setTimeout(() => setMonsterAttack(null), 150);
              newLogs.push(`${e.name} strikes you for ${damage} damage. Ow.`);
            } else {
              // Move towards player
              const moveX = dx !== 0 ? Math.sign(dx) : 0;
              const moveY = dy !== 0 ? Math.sign(dy) : 0;
              const nextPos = { x: e.pos.x + moveX, y: e.pos.y + moveY };
              
              const isBlocked = prev.grid[nextPos.y][nextPos.x] === 'wall' || 
                                newEntities.some(other => other.id !== e.id && other.pos.x === nextPos.x && other.pos.y === nextPos.y) ||
                                (prev.player.pos.x === nextPos.x && prev.player.pos.y === nextPos.y);

              if (!isBlocked) {
                e.pos = nextPos;
              }
            }
          }
        }
      });

      const isGameOver = playerHp <= 0 || playerSanity <= 0;

      // Status checks (low health/sanity)
      if (!isGameOver && Math.random() < 0.1) { // 10% chance to show status log if low
        if (playerHp < prev.player.stats!.maxHp * 0.3) {
           const lowHpLog = LOW_HEALTH_LOGS[Math.floor(Math.random() * LOW_HEALTH_LOGS.length)];
           newLogs.push(lowHpLog);
        } else if (playerSanity < prev.player.stats!.maxSanity * 0.3) {
           const lowSanityLog = LOW_SANITY_LOGS[Math.floor(Math.random() * LOW_SANITY_LOGS.length)];
           newLogs.push(lowSanityLog);
        }
      }

      // Meta Commentary
      if (!isGameOver && Math.random() < 0.05) { // 5% chance per turn
        const metaLog = META_COMMENTARY[Math.floor(Math.random() * META_COMMENTARY.length)];
        newLogs.push(`[META]: ${metaLog}`);
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          stats: { ...prev.player.stats!, hp: playerHp, sanity: playerSanity }
        },
        entities: newEntities,
        logs: newLogs.slice(-50),
        turn: prev.turn + 1,
        isGameOver
      };
    });
  };

  const nextLevel = () => {
    setGameState(prev => {
      if (!prev) return null;
      const nextLvl = prev.level + 1;
      
      const isThemed = Math.random() < 0.2;
      const currentTheme = isThemed ? THEMES[Math.floor(Math.random() * THEMES.length)] : null;

      const { grid, rooms: rawRooms } = generateLevel(GRID_WIDTH, GRID_HEIGHT, nextLvl);
      const rooms: Room[] = rawRooms.map((r, i) => ({
        ...r,
        id: `room-${nextLvl}-${i}`,
        description: currentTheme 
          ? (Math.random() > 0.5 ? currentTheme.roomDescriptions[Math.floor(Math.random() * currentTheme.roomDescriptions.length)] : ROOM_DESCRIPTIONS[Math.floor(Math.random() * ROOM_DESCRIPTIONS.length)])
          : ROOM_DESCRIPTIONS[Math.floor(Math.random() * ROOM_DESCRIPTIONS.length)],
        visited: false
      }));

      const playerPos = { 
        x: Math.floor(rooms[0].x + rooms[0].w / 2), 
        y: Math.floor(rooms[0].y + rooms[0].h / 2) 
      };

      const entities: Entity[] = [];
      const allMonsters = [...MONSTERS, ...ADDITIONAL_MONSTERS];
      // Filter monsters appropriate for this level (e.g., level - 4 to level)
      // This ensures we don't get level 1 rats on level 20, but we do get level 16-20 monsters.
      const minMonsterLevel = Math.max(1, nextLvl - 4);
      let levelMonsters = allMonsters.filter(m => {
        const mLevel = m.minLevel || 1;
        return mLevel <= nextLvl && mLevel >= minMonsterLevel;
      });

      // Fallback if no monsters match (shouldn't happen with our distribution, but safety first)
      let spawnPool = levelMonsters.length > 0 ? levelMonsters : allMonsters.filter(m => (m.minLevel || 1) <= nextLvl);

      if (currentTheme) {
        const themeMonsters = allMonsters.filter(m => currentTheme.monsterNames.includes(m.name!));
        if (themeMonsters.length > 0) {
          // Mix theme monsters with level monsters, but prioritize theme
          spawnPool = [...themeMonsters, ...themeMonsters, ...spawnPool]; 
        }
      }

      for (let i = 0; i < 5 + nextLvl; i++) {
        const pos = getRandomFloorPos(grid);
        const template = spawnPool[Math.floor(Math.random() * spawnPool.length)];
        entities.push({ ...template, id: `monster-${nextLvl}-${i}`, type: 'monster', pos } as Entity);
      }
      for (let i = 0; i < 3; i++) {
        const pos = getRandomFloorPos(grid);
        const template = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        entities.push({ ...template, id: `item-${nextLvl}-${i}`, type: 'item', pos } as Entity);
      }

      // Lore (Less frequent)
      const allLore = [...LORE_ENTRIES, ...ADDITIONAL_LORE];
      if (Math.random() > 0.6) { // 40% chance of 1 tome
        const pos = getRandomFloorPos(grid);
        const lore = allLore[Math.floor(Math.random() * allLore.length)];
        entities.push({
          id: `lore-${nextLvl}-0`,
          type: 'lore',
          name: 'Ancient Tome',
          char: '?',
          color: '#fbbf24',
          pos,
          loreId: lore.id,
          description: 'A dusty, leather-bound book filled with cryptic writing.'
        });
      }

      // NPCs
      if (Math.random() > 0.4) {
        const pos = getRandomRoomPos(rawRooms);
        const allNpcs = [...NPCS, ...ADDITIONAL_NPCS];
        const npcTemplate = allNpcs[Math.floor(Math.random() * allNpcs.length)];
        entities.push({ ...npcTemplate, id: `npc-${nextLvl}-${Date.now()}`, type: 'npc', pos } as Entity);
      }

      // Environment
      for (let i = 0; i < 3; i++) {
        const pos = getRandomFloorPos(grid);
        let envTemplate = currentTheme 
          ? (Math.random() > 0.3 ? currentTheme.environmentalDetails[Math.floor(Math.random() * currentTheme.environmentalDetails.length)] : ENVIRONMENTAL_DETAILS[Math.floor(Math.random() * ENVIRONMENTAL_DETAILS.length)])
          : ENVIRONMENTAL_DETAILS[Math.floor(Math.random() * ENVIRONMENTAL_DETAILS.length)];

        // Apply unique descriptions for altars and carvings
        if (envTemplate.name === 'Blood-Stained Altar') {
           envTemplate = { ...envTemplate, description: ALTAR_DESCRIPTIONS[Math.floor(Math.random() * ALTAR_DESCRIPTIONS.length)] };
        } else if (envTemplate.name === 'Strange Carvings') {
           envTemplate = { ...envTemplate, description: CARVING_DESCRIPTIONS[Math.floor(Math.random() * CARVING_DESCRIPTIONS.length)] };
        }

        entities.push({ ...envTemplate, id: `env-${nextLvl}-${i}`, type: 'environment', pos } as Entity);
      }

      const initialExplored = Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(false));
      const visible = getVisibleTiles(grid, playerPos);
      visible.forEach(key => {
        const [x, y] = key.split(',').map(Number);
        initialExplored[y][x] = true;
      });

      const nextLogs = [...prev.logs, `You descend deeper into the abyss... Level ${nextLvl}. The air is getting thinner, and the existential dread is getting thicker.`];
      if (currentTheme) {
        nextLogs.push(`[THEME]: ${currentTheme.introLog}`);
      }

      return {
        ...prev,
        level: nextLvl,
        grid,
        player: { ...prev.player, pos: playerPos },
        entities,
        logs: nextLogs,
        discoveredLore: prev.discoveredLore,
        explored: initialExplored,
        rooms,
        currentRoomIndex: 0,
        currentTheme
      };
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (activeLore || activeDialogue || activeStairs) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          if (activeStairs && e.key === 'Enter') {
             nextLevel();
          }
          setActiveLore(null);
          setActiveDialogue(null);
          setActiveStairs(null);
        }
        return;
      }
      switch (e.key) {
        case 'ArrowUp': case 'w': movePlayer(0, -1); break;
        case 'ArrowDown': case 's': movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': movePlayer(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeLore, activeDialogue, activeStairs]);

  if (!gameState) return <div className="bg-black h-screen flex items-center justify-center text-emerald-500 font-mono">Initializing David Foster Lovecraft...</div>;

  const visibleTiles = getVisibleTiles(gameState.grid, gameState.player.pos);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-300 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-stone-800 p-4 flex justify-between items-center bg-[#0d0d0d]">
        <div className="flex items-center gap-3">
          <Skull className="text-emerald-500 w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tighter text-stone-100 uppercase">David Foster Lovecraft</h1>
        </div>
        <div className="flex gap-6 text-xs font-mono uppercase tracking-widest text-stone-500">
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4" />
            Depth: <span className="text-stone-200">{gameState.level}</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            Turn: <span className="text-stone-200">{gameState.turn}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Game Area */}
        <div className="space-y-6 overflow-hidden">
          <div className="overflow-x-auto pb-4 lg:pb-0">
            <motion.div 
              animate={screenShake ? {
                x: [0, -4, 4, -4, 4, 0],
                y: [0, 2, -2, 2, -2, 0]
              } : { x: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-[#050505] border border-stone-800 rounded-xl overflow-hidden shadow-2xl shrink-0"
              style={{ 
                width: GRID_WIDTH * TILE_SIZE, 
                height: GRID_HEIGHT * TILE_SIZE,
                margin: '0 auto'
              }}
            >
            {/* Grid Rendering */}
            {gameState.grid.map((row, y) => (
              row.map((cell, x) => {
                const isVisible = visibleTiles.has(`${x},${y}`);
                const isExplored = gameState.explored[y][x];

                if (!isExplored) {
                  return (
                    <div 
                      key={`${x}-${y}`}
                      className="absolute bg-black z-20"
                      style={{ 
                        left: x * TILE_SIZE, 
                        top: y * TILE_SIZE, 
                        width: TILE_SIZE, 
                        height: TILE_SIZE
                      }}
                    />
                  );
                }

                return (
                  <div 
                    key={`${x}-${y}`}
                    className={cn(
                      "absolute transition-colors duration-200",
                      cell === 'wall' ? "bg-stone-900" : "bg-stone-950/50",
                      cell === 'stairs' && "bg-emerald-900/40 animate-pulse",
                      !isVisible && "opacity-20 grayscale"
                    )}
                    style={{ 
                      left: x * TILE_SIZE, 
                      top: y * TILE_SIZE, 
                      width: TILE_SIZE, 
                      height: TILE_SIZE,
                      border: '0.5px solid rgba(255,255,255,0.02)'
                    }}
                  >
                    {cell === 'stairs' && <div className="w-full h-full flex items-center justify-center text-[10px] text-emerald-400">▼</div>}
                  </div>
                );
              })
            ))}

            {/* Entities */}
            <AnimatePresence>
              {gameState.entities.map(entity => {
                const isVisible = visibleTiles.has(`${entity.pos.x},${entity.pos.y}`);
                if (!isVisible) return null;

                const isAttacking = monsterAttack?.id === entity.id;
                return (
                  <motion.div
                    key={entity.id}
                    initial={false}
                    animate={{ 
                      x: (entity.pos.x * TILE_SIZE) + (isAttacking ? monsterAttack.dx * 12 : 0), 
                      y: (entity.pos.y * TILE_SIZE) + (isAttacking ? monsterAttack.dy * 12 : 0)
                    }}
                    transition={isAttacking ? { type: 'spring', stiffness: 500, damping: 15 } : { type: 'tween', duration: 0.1 }}
                    className="absolute flex items-center justify-center cursor-help"
                    style={{ width: TILE_SIZE, height: TILE_SIZE, color: entity.color }}
                    onClick={() => setSelectedEntity(entity)}
                  >
                    <span className="text-lg font-bold drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">
                      {entity.char}
                    </span>
                    {entity.type === 'monster' && entity.stats && (
                      <>
                        <div className="absolute -top-1 left-0 w-full h-[3px] bg-stone-900 border border-black/50 rounded-full overflow-hidden z-20">
                          <div 
                            className="h-full bg-red-600 transition-all duration-300" 
                            style={{ width: `${(entity.stats.hp / entity.stats.maxHp) * 100}%` }}
                          />
                        </div>
                        {entity.stats.hp < entity.stats.maxHp && (
                          <div className="absolute -bottom-1.5 left-0 w-full text-[8px] font-mono font-bold text-red-500 text-center leading-none z-20 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                            {entity.stats.hp}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Player */}
            <motion.div
              animate={{ 
                x: (gameState.player.pos.x * TILE_SIZE) + (playerAttackDir ? playerAttackDir.dx * 12 : 0), 
                y: (gameState.player.pos.y * TILE_SIZE) + (playerAttackDir ? playerAttackDir.dy * 12 : 0)
              }}
              transition={playerAttackDir ? { type: 'spring', stiffness: 500, damping: 15 } : { type: 'tween', duration: 0.1 }}
              className="absolute flex items-center justify-center z-10"
              style={{ width: TILE_SIZE, height: TILE_SIZE }}
            >
              <div className="text-white text-lg font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">@</div>
              <div className="absolute inset-0 bg-white/10 rounded-full blur-sm animate-pulse" />
              
              {/* Player Health Bar */}
              <div className="absolute -top-1 left-0 w-full h-[3px] bg-stone-900 border border-black/50 rounded-full overflow-hidden z-20">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${(gameState.player.stats!.hp / gameState.player.stats!.maxHp) * 100}%` }}
                />
              </div>

              {/* Player Sanity Bar */}
              <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-stone-900 border border-black/50 rounded-full overflow-hidden z-20">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300" 
                  style={{ width: `${(gameState.player.stats!.sanity / gameState.player.stats!.maxSanity) * 100}%` }}
                />
              </div>
            </motion.div>

            {/* Lore Modal */}
            <AnimatePresence>
              {activeLore && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-8"
                >
                  <div className="max-w-md w-full bg-[#0d0d0d] border border-amber-900/30 p-8 rounded-xl shadow-[0_0_50px_rgba(120,53,15,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-900/50 to-transparent" />
                    <BookOpen className="w-8 h-8 text-amber-600 mb-6 mx-auto opacity-50" />
                    <h2 className="text-2xl font-serif text-amber-200 text-center mb-4 italic tracking-tight">{activeLore.title}</h2>
                    <div className="h-px bg-amber-900/20 w-1/2 mx-auto mb-6" />
                    <p className="text-stone-400 font-serif leading-relaxed text-sm italic first-letter:text-3xl first-letter:text-amber-500 first-letter:mr-1 first-letter:float-left">
                      {activeLore.content}
                    </p>
                    {activeLore.author && (
                      <p className="mt-8 text-right text-[10px] uppercase tracking-widest text-amber-900/60 font-mono">
                        — {activeLore.author}
                      </p>
                    )}
                    <button 
                      onClick={() => setActiveLore(null)}
                      className="mt-10 w-full py-2 border border-amber-900/20 text-amber-900/40 text-[10px] uppercase tracking-[0.3em] hover:text-amber-500 hover:border-amber-500/50 transition-all font-mono"
                    >
                      Close Tome [ESC]
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dialogue Modal */}
            <AnimatePresence>
              {activeDialogue && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[80%] bg-[#0d0d0d] border border-stone-800 p-6 rounded-xl shadow-2xl z-[60] flex gap-6 items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-2xl border border-stone-800" style={{ color: activeDialogue.npc.color }}>
                    {activeDialogue.npc.char}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">{activeDialogue.npc.name}</h3>
                    <p className="text-stone-200 italic font-serif leading-relaxed">"{activeDialogue.text}"</p>
                  </div>
                  <button 
                    onClick={() => setActiveDialogue(null)}
                    className="text-stone-600 hover:text-stone-400 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stairs Modal */}
            <AnimatePresence>
              {activeStairs && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-8"
                >
                  <div className="max-w-md w-full bg-[#0d0d0d] border border-stone-800 p-8 rounded-xl shadow-2xl text-center">
                    <h2 className="text-xl font-bold text-stone-200 mb-4 uppercase tracking-widest">Staircase Discovered</h2>
                    <p className="text-stone-400 italic font-serif mb-8 leading-relaxed">
                      {activeStairs.description}
                    </p>
                    <p className="text-stone-500 text-xs mb-6 uppercase tracking-widest">Do you wish to descend?</p>
                    <div className="flex gap-4 justify-center">
                      <button 
                        onClick={() => {
                          nextLevel();
                          setActiveStairs(null);
                        }}
                        className="px-6 py-2 bg-emerald-900/30 border border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/50 transition-colors text-xs uppercase tracking-widest font-bold"
                      >
                        Descend [ENTER]
                      </button>
                      <button 
                        onClick={() => setActiveStairs(null)}
                        className="px-6 py-2 bg-stone-900 border border-stone-800 text-stone-400 hover:bg-stone-800 transition-colors text-xs uppercase tracking-widest font-bold"
                      >
                        Stay [ESC]
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game Over Overlay */}
            {gameState.isGameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-8 text-center">
                <Skull className="w-16 h-16 text-red-600 mb-4 animate-bounce" />
                <h2 className="text-4xl font-black text-stone-100 mb-2 uppercase tracking-tighter">Your Journey Ends (Prematurely)</h2>
                <p className="text-stone-400 mb-8 max-w-md">
                  The cosmic indifference of the universe has claimed another soul—which is to say, you are now a statistic in a reality that doesn\'t even have a column for "Human Effort." Your mind shatters as the darkness consumes you, and frankly, it\'s a bit of a relief.
                </p>
                <button 
                  onClick={initGame}
                  className="px-8 py-3 bg-stone-100 text-black font-bold uppercase tracking-widest hover:bg-emerald-500 transition-colors rounded-sm"
                >
                  Try Again (Why?)
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Controls Hint & D-Pad */}
        <div className="space-y-8">
            <div className="hidden lg:flex justify-center gap-8 text-[10px] uppercase tracking-[0.2em] text-stone-600 font-mono">
              <div className="flex items-center gap-2"><div className="px-1.5 py-0.5 border border-stone-800 rounded">WASD</div> Move</div>
              <div className="flex items-center gap-2"><div className="px-1.5 py-0.5 border border-stone-800 rounded">ARROWS</div> Move</div>
              <div className="flex items-center gap-2"><div className="px-1.5 py-0.5 border border-stone-800 rounded">CLICK</div> Inspect</div>
            </div>
            
            <DPad onMove={movePlayer} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-[#0d0d0d] border border-stone-800 rounded-xl p-6 space-y-6 shadow-xl">
            <div className="flex border-b border-stone-800 mb-4">
              <button 
                onClick={() => setShowInventory(false)}
                className={cn(
                  "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                  !showInventory ? "text-emerald-500 border-b-2 border-emerald-500" : "text-stone-500 hover:text-stone-300"
                )}
              >
                Status
              </button>
              <button 
                onClick={() => setShowInventory(true)}
                className={cn(
                  "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                  showInventory ? "text-emerald-500 border-b-2 border-emerald-500" : "text-stone-500 hover:text-stone-300"
                )}
              >
                Inventory ({gameState.player.inventory?.length || 0})
              </button>
            </div>

            {!showInventory ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 text-red-500">
                      <Heart className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Vitality</span>
                    </div>
                    <span className="text-xs font-mono text-stone-400">{gameState.player.stats?.hp} / {gameState.player.stats?.maxHp}</span>
                  </div>
                  <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-red-600" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(gameState.player.stats!.hp / gameState.player.stats!.maxHp) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Brain className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Sanity</span>
                    </div>
                    <span className="text-xs font-mono text-stone-400">{gameState.player.stats?.sanity} / {gameState.player.stats?.maxSanity}</span>
                  </div>
                  <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(gameState.player.stats!.sanity / gameState.player.stats!.maxSanity) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-stone-500">
                      <Sword className="w-3 h-3" />
                      <span className="text-[9px] uppercase font-bold tracking-widest">Attack</span>
                    </div>
                    <div className="text-lg font-mono text-stone-200">
                      {getEffectiveStats(gameState.player).attack}
                      {getEffectiveStats(gameState.player).attack > gameState.player.stats!.attack && (
                        <span className="text-emerald-500 text-xs ml-1">+{getEffectiveStats(gameState.player).attack - gameState.player.stats!.attack}</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-stone-500">
                      <Shield className="w-3 h-3" />
                      <span className="text-[9px] uppercase font-bold tracking-widest">Defense</span>
                    </div>
                    <div className="text-lg font-mono text-stone-200">
                      {getEffectiveStats(gameState.player).defense}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {gameState.player.inventory?.length === 0 ? (
                  <div className="text-center py-8 text-stone-600 text-[10px] uppercase tracking-widest">Empty</div>
                ) : (
                  gameState.player.inventory?.map((item, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "p-3 rounded-lg border transition-all",
                        item.isEquipped ? "bg-emerald-950/20 border-emerald-900/50" : "bg-stone-900/50 border-stone-800 hover:border-stone-700"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-stone-200 uppercase tracking-tight">{item.name}</span>
                        {item.isEquipped && <span className="text-[8px] bg-emerald-500 text-black px-1 rounded font-bold uppercase">Equipped</span>}
                      </div>
                      <p className="text-[9px] text-stone-500 italic mb-3 leading-tight">{item.description}</p>
                      <button 
                        onClick={() => useItem(item)}
                        className={cn(
                          "w-full py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all",
                          item.isEquipped ? "bg-stone-800 text-stone-400 hover:bg-stone-700" : 
                          item.type === 'weapon' ? "bg-emerald-600 text-white hover:bg-emerald-500" :
                          "bg-blue-600 text-white hover:bg-blue-500"
                        )}
                      >
                        {item.type === 'weapon' ? (item.isEquipped ? "Unequip" : "Equip") : "Use"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Logs */}
          <div className="bg-[#0d0d0d] border border-stone-800 rounded-xl flex flex-col h-[450px] shadow-xl">
            <div className="p-3 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-400">
                <Scroll className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Journal</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] leading-relaxed">
              {gameState.logs.map((log, i) => (
                <div key={i} className={cn(
                  "border-l-2 pl-3 py-0.5 flex items-start gap-2",
                  log.includes('attacks') ? "border-red-900 text-stone-400" : 
                  log.includes('sanity') ? "border-blue-900 text-blue-200/70" :
                  log.includes('defeated') ? "border-emerald-900 text-emerald-400" :
                  log.includes('discovered') ? "border-amber-600 text-amber-200" :
                  log.startsWith('[META-COMMENTARY]') ? "border-violet-900/50 text-violet-400 italic font-serif" :
                  log.startsWith('"') ? "border-amber-900/50 text-amber-500/70 italic" :
                  log.includes('speak') ? "border-stone-500 text-stone-300" :
                  "border-stone-800 text-stone-500"
                )}>
                  {log.startsWith('"') && <BookOpen className="w-3 h-3 mt-0.5 shrink-0 opacity-40" />}
                  <span>{log}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Selected Entity Info */}
          <AnimatePresence mode="wait">
            {selectedEntity ? (
              <motion.div 
                key={selectedEntity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={cn(
                  "border rounded-xl p-4 relative shadow-lg",
                  selectedEntity.type === 'monster' ? "bg-red-950/10 border-red-900/30" :
                  selectedEntity.type === 'lore' ? "bg-amber-950/10 border-amber-900/30" :
                  selectedEntity.type === 'npc' ? "bg-stone-900 border-stone-800" :
                  selectedEntity.type === 'environment' ? "bg-emerald-950/10 border-emerald-900/30" :
                  "bg-stone-900 border-stone-800"
                )}
              >
                <button 
                  onClick={() => setSelectedEntity(null)}
                  className="absolute top-2 right-2 text-stone-700 hover:text-stone-400"
                >
                  ×
                </button>
                <div className="flex items-start gap-3">
                  <div className="text-2xl" style={{ color: selectedEntity.color }}>{selectedEntity.char}</div>
                  <div>
                    <h3 className={cn(
                      "text-sm font-bold uppercase tracking-tight",
                      selectedEntity.type === 'monster' ? "text-red-400" :
                      selectedEntity.type === 'lore' ? "text-amber-400" :
                      selectedEntity.type === 'npc' ? "text-stone-200" :
                      selectedEntity.type === 'environment' ? "text-emerald-400" :
                      "text-stone-400"
                    )}>{selectedEntity.name}</h3>
                    <p className="text-[10px] text-stone-500 italic mt-1 leading-relaxed">{selectedEntity.description}</p>
                    
                    {selectedEntity.type === 'npc' && (
                      <div className="mt-3 flex items-center gap-2 text-[9px] font-bold text-stone-600 uppercase tracking-widest">
                        <MessageSquare className="w-3 h-3" />
                        Walk into to speak
                      </div>
                    )}

                    {selectedEntity.type === 'lore' && (
                      <div className="mt-3 flex items-center gap-2 text-[9px] font-bold text-amber-600 uppercase tracking-widest">
                        <BookOpen className="w-3 h-3" />
                        Walk into to read
                      </div>
                    )}

                    {selectedEntity.stats && (
                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-mono uppercase text-stone-600">
                        <div>HP: {selectedEntity.stats.hp}/{selectedEntity.stats.maxHp}</div>
                        <div>ATK: {selectedEntity.stats.attack}</div>
                        <div>DEF: {selectedEntity.stats.defense}</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#0d0d0d] border border-stone-800 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center opacity-40">
                <Info className="w-6 h-6 text-stone-600 mb-2" />
                <p className="text-[10px] uppercase tracking-widest text-stone-500">Select an entity to inspect</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer / Credits */}
      <footer className="mt-12 p-8 border-t border-stone-900 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-stone-700">
          Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn
        </p>
      </footer>
    </div>
  );
}
