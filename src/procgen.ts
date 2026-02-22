import { EntityType, Position } from './types';

export function generateLevel(width: number, height: number, level: number) {
  const grid: EntityType[][] = Array(height).fill(null).map(() => Array(width).fill('wall'));

  // Simple Room-based generation
  const rooms: { x: number, y: number, w: number, h: number }[] = [];
  const maxRooms = 8 + level;
  const minRoomSize = 4;
  const maxRoomSize = 10;

  for (let i = 0; i < maxRooms; i++) {
    const w = Math.floor(Math.random() * (maxRoomSize - minRoomSize)) + minRoomSize;
    const h = Math.floor(Math.random() * (maxRoomSize - minRoomSize)) + minRoomSize;
    const x = Math.floor(Math.random() * (width - w - 2)) + 1;
    const y = Math.floor(Math.random() * (height - h - 2)) + 1;

    const newRoom = { x, y, w, h };
    const intersects = rooms.some(r => 
      newRoom.x < r.x + r.w + 1 &&
      newRoom.x + newRoom.w + 1 > r.x &&
      newRoom.y < r.y + r.h + 1 &&
      newRoom.y + newRoom.h + 1 > r.y
    );

    if (!intersects) {
      // Carve room
      for (let ry = y; ry < y + h; ry++) {
        for (let rx = x; rx < x + w; rx++) {
          grid[ry][rx] = 'floor';
        }
      }

      if (rooms.length > 0) {
        const prev = rooms[rooms.length - 1];
        const prevCenter = { x: Math.floor(prev.x + prev.w / 2), y: Math.floor(prev.y + prev.h / 2) };
        const currCenter = { x: Math.floor(x + w / 2), y: Math.floor(y + h / 2) };

        // Horizontal tunnel
        for (let tx = Math.min(prevCenter.x, currCenter.x); tx <= Math.max(prevCenter.x, currCenter.x); tx++) {
          grid[prevCenter.y][tx] = 'floor';
        }
        // Vertical tunnel
        for (let ty = Math.min(prevCenter.y, currCenter.y); ty <= Math.max(prevCenter.y, currCenter.y); ty++) {
          grid[ty][currCenter.x] = 'floor';
        }
      }
      rooms.push(newRoom);
    }
  }

  // Place stairs in the last room
  const lastRoom = rooms[rooms.length - 1];
  const stairsPos = { 
    x: Math.floor(lastRoom.x + lastRoom.w / 2), 
    y: Math.floor(lastRoom.y + lastRoom.h / 2) 
  };
  grid[stairsPos.y][stairsPos.x] = 'stairs';

  return { grid, rooms };
}

export function getRandomFloorPos(grid: EntityType[][]): Position {
  let x, y;
  do {
    x = Math.floor(Math.random() * grid[0].length);
    y = Math.floor(Math.random() * grid.length);
  } while (grid[y][x] !== 'floor');
  return { x, y };
}

export function getRandomRoomPos(rooms: { x: number, y: number, w: number, h: number }[]): Position {
  const room = rooms[Math.floor(Math.random() * rooms.length)];
  
  // Try to pick a spot that is not in the "crosshairs" of the room center
  // This helps avoid blocking the main paths (tunnels) that usually connect to the center
  const centerX = Math.floor(room.x + room.w / 2);
  const centerY = Math.floor(room.y + room.h / 2);

  let px, py;
  let attempts = 0;
  do {
    px = Math.floor(Math.random() * room.w) + room.x;
    py = Math.floor(Math.random() * room.h) + room.y;
    attempts++;
  } while ((px === centerX || py === centerY) && attempts < 20);
  
  return { x: px, y: py };
}
