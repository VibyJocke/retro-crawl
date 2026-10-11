import Phaser from "phaser";

export type Point = { x: number; y: number };
export type DungeonMap = {
  tiles: boolean[][];
  explored: boolean[][];
  visible: boolean[][];
  player: Point;
  exit: Point;
  floor: number;
};

type SceneCallbacks = {
  onMove: (position: Point) => void;
  onMapChange: (map: DungeonMap) => void;
  onSpace: () => void;
};

const MAP_WIDTH = 27;
const MAP_HEIGHT = 19;
const FLOOR_NAMES = [
  "The Mossbound Halls",
  "The Sunken Gallery",
  "The Ashen Reliquary",
  "The Deep Below",
];

export function floorName(floor: number): string {
  return FLOOR_NAMES[floor - 1] ?? "The Deep Below";
}

export class DungeonScene extends Phaser.Scene {
  private readonly callbacks: SceneCallbacks;
  private graphics!: Phaser.GameObjects.Graphics;
  private tiles: boolean[][] = [];
  private explored: boolean[][] = [];
  private visible: boolean[][] = [];
  private player: Point = { x: 2, y: 2 };
  private exit: Point = { x: MAP_WIDTH - 2, y: MAP_HEIGHT - 2 };
  private floor = 1;
  private runSeed = Math.floor(Math.random() * 4294967296);
  private tileSize = 24;
  private offsetX = 0;
  private offsetY = 0;
  private zoom = 1;
  private locked = true;

  constructor(callbacks: SceneCallbacks) {
    super("Dungeon");
    this.callbacks = callbacks;
  }

  create(): void {
    this.graphics = this.add.graphics();
    this.scale.on(Phaser.Scale.Events.RESIZE, () => this.paint());
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (this.locked) return;
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("button, input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }
      const directions: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 },
        KeyW: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        KeyS: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        KeyA: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        KeyD: { x: 1, y: 0 },
      };
      const direction = directions[event.code];
      if (direction) {
        event.preventDefault();
        this.move(direction.x, direction.y);
      } else if (event.code === "Space") {
        event.preventDefault();
        this.callbacks.onSpace();
      }
    });
    this.buildFloor(1);
    this.locked = true;
  }

  setLocked(locked: boolean): void {
    this.locked = locked;
  }

  startRun(): void {
    this.runSeed = Math.floor(Math.random() * 4294967296);
    this.buildFloor(1);
  }

  moveBy(x: number, y: number): void {
    if (!this.locked) this.move(x, y);
  }

  zoomBy(amount: number): void {
    this.zoom = Phaser.Math.Clamp(this.zoom + amount, 0.8, 1.25);
    this.paint();
  }

  buildFloor(floor: number): void {
    this.floor = floor;
    this.tiles = Array.from({ length: MAP_HEIGHT }, (_, y) =>
      Array.from({ length: MAP_WIDTH }, (_, x) =>
        x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1,
      ),
    );

    const verticalWalls = [7, 13, 19];
    const verticalDoorRows = [2, 8, 14].map((row, index) => row + ((floor + this.runSeed + index) % 2));
    for (const x of verticalWalls) {
      for (let y = 1; y < MAP_HEIGHT - 1; y++) this.tiles[y][x] = true;
      for (const doorY of verticalDoorRows) {
        this.tiles[doorY][x] = false;
        this.tiles[doorY + 1][x] = false;
      }
    }

    const horizontalDoorColumns = [2, 8, 14, 20].map((column, index) => column + ((floor + this.runSeed + index) % 3));
    for (const y of [6, 12]) {
      for (let x = 1; x < MAP_WIDTH - 1; x++) this.tiles[y][x] = true;
      for (const doorX of horizontalDoorColumns) {
        this.tiles[y][doorX] = false;
        this.tiles[y][doorX + 1] = false;
      }
    }

    this.player = { x: 2, y: 2 };
    this.tiles[this.player.y][this.player.x] = false;
    this.addRoomDetails((this.runSeed + floor * 191 + 73) % 4294967296);
    this.exit = this.findFarthestTile(this.player);
    this.explored = Array.from({ length: MAP_HEIGHT }, () =>
      Array<boolean>(MAP_WIDTH).fill(false),
    );
    this.visible = Array.from({ length: MAP_HEIGHT }, () =>
      Array<boolean>(MAP_WIDTH).fill(false),
    );
    this.reveal();
    this.locked = false;
    this.paint();
    this.publishMap();
  }

  private addRoomDetails(seed: number): void {
    const random = this.seededRandom(seed);
    const rooms = [
      { x: 2, y: 2, w: 4, h: 3 },
      { x: 8, y: 2, w: 4, h: 3 },
      { x: 14, y: 2, w: 4, h: 3 },
      { x: 20, y: 2, w: 5, h: 3 },
      { x: 2, y: 7, w: 4, h: 4 },
      { x: 8, y: 7, w: 4, h: 4 },
      { x: 14, y: 7, w: 4, h: 4 },
      { x: 20, y: 7, w: 5, h: 4 },
      { x: 2, y: 13, w: 4, h: 4 },
      { x: 8, y: 13, w: 4, h: 4 },
      { x: 14, y: 13, w: 4, h: 4 },
      { x: 20, y: 13, w: 5, h: 4 },
    ];

    for (const room of rooms) {
      const pillars = random() > 0.48 ? 1 : 0;
      for (let i = 0; i < pillars; i++) {
        const x = room.x + 1 + Math.floor(random() * (room.w - 2));
        const y = room.y + 1 + Math.floor(random() * (room.h - 2));
        if (x !== this.player.x || y !== this.player.y) this.tiles[y][x] = true;
      }
    }
  }

  private seededRandom(seed: number): () => number {
    let value = seed;
    return () => {
      value = (value * 1664525 + 1013904223) % 4294967296;
      return value / 4294967296;
    };
  }

  private findFarthestTile(start: Point): Point {
    const queue: Point[] = [start];
    const distances = new Map<string, number>([[`${start.x},${start.y}`, 0]]);
    let farthest = start;
    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];

    for (let index = 0; index < queue.length; index++) {
      const point = queue[index];
      for (const direction of directions) {
        const next = { x: point.x + direction.x, y: point.y + direction.y };
        const key = `${next.x},${next.y}`;
        if (
          next.x < 1 ||
          next.y < 1 ||
          next.x >= MAP_WIDTH - 1 ||
          next.y >= MAP_HEIGHT - 1 ||
          this.tiles[next.y][next.x] ||
          distances.has(key)
        ) {
          continue;
        }
        distances.set(key, distances.get(`${point.x},${point.y}`)! + 1);
        queue.push(next);
        if (distances.get(key)! > distances.get(`${farthest.x},${farthest.y}`)!) {
          farthest = next;
        }
      }
    }
    return farthest;
  }

  private move(dx: number, dy: number): void {
    const next = { x: this.player.x + dx, y: this.player.y + dy };
    if (this.tiles[next.y]?.[next.x] !== false) return;
    this.player = next;
    this.reveal();
    this.paint();
    this.publishMap();
    this.callbacks.onMove({ ...this.player });
  }

  private reveal(): void {
    this.visible = Array.from({ length: MAP_HEIGHT }, () =>
      Array<boolean>(MAP_WIDTH).fill(false),
    );
    for (let y = Math.max(0, this.player.y - 4); y <= Math.min(MAP_HEIGHT - 1, this.player.y + 4); y++) {
      for (let x = Math.max(0, this.player.x - 4); x <= Math.min(MAP_WIDTH - 1, this.player.x + 4); x++) {
        if (Math.abs(x - this.player.x) + Math.abs(y - this.player.y) <= 5) {
          this.visible[y][x] = true;
          this.explored[y][x] = true;
        }
      }
    }
  }

  private publishMap(): void {
    this.callbacks.onMapChange({
      tiles: this.tiles,
      explored: this.explored,
      visible: this.visible,
      player: { ...this.player },
      exit: { ...this.exit },
      floor: this.floor,
    });
  }

  private paint(): void {
    if (!this.graphics) return;
    const width = this.scale.width;
    const height = this.scale.height;
    this.tileSize = Math.floor(Math.min(width / MAP_WIDTH, height / MAP_HEIGHT) * this.zoom);
    this.offsetX = Math.floor((width - MAP_WIDTH * this.tileSize) / 2);
    this.offsetY = Math.floor((height - MAP_HEIGHT * this.tileSize) / 2);
    const g = this.graphics;
    g.clear();
    g.fillStyle(0x101816, 1);
    g.fillRect(0, 0, width, height);

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (!this.explored[y]?.[x]) {
          g.fillStyle(0x0c1211, 1);
          g.fillRect(this.px(x), this.py(y), this.tileSize, this.tileSize);
          continue;
        }
        const px = this.px(x);
        const py = this.py(y);
        const size = this.tileSize;
        const isVisible = this.visible[y][x];
        if (this.tiles[y][x]) {
          g.fillStyle(isVisible ? 0x26362e : 0x1a2622, 1);
          g.fillRect(px, py, size, size);
          g.fillStyle(isVisible ? 0x34463a : 0x23312b, 0.8);
          g.fillRect(px + 2, py + 2, size - 4, 3);
          g.fillStyle(0x101715, 0.75);
          g.fillRect(px + 2, py + size - 5, size - 4, 3);
          g.lineStyle(1, 0x405043, isVisible ? 0.45 : 0.2);
          g.strokeRect(px + 3.5, py + 4.5, size - 7, size - 9);
        } else {
          g.fillStyle(isVisible ? 0x1c2a25 : 0x151f1c, 1);
          g.fillRect(px, py, size, size);
          g.lineStyle(1, 0x334239, isVisible ? 0.28 : 0.14);
          g.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
          const grain = ((x * 13 + y * 7 + this.floor * 3) % 11) === 0;
          if (grain) {
            g.fillStyle(isVisible ? 0x32473a : 0x26362f, 0.55);
            g.fillCircle(px + size * 0.72, py + size * 0.3, Math.max(1, size * 0.045));
          }
        }
        if (!isVisible) {
          g.fillStyle(0x090e0d, 0.35);
          g.fillRect(px, py, size, size);
        }
      }
    }

    if (this.explored[this.exit.y]?.[this.exit.x]) this.paintExit();
    this.paintPlayer();
  }

  private paintExit(): void {
    const g = this.graphics;
    const cx = this.px(this.exit.x) + this.tileSize / 2;
    const cy = this.py(this.exit.y) + this.tileSize / 2;
    const radius = this.tileSize * 0.33;
    const alpha = this.visible[this.exit.y][this.exit.x] ? 1 : 0.58;
    g.fillStyle(0x4a3620, alpha * 0.6);
    g.fillCircle(cx, cy, radius * 1.45);
    g.lineStyle(Math.max(2, this.tileSize * 0.09), 0xd4a85e, alpha);
    g.strokeCircle(cx, cy, radius);
    g.lineStyle(1, 0xf0d99b, alpha * 0.7);
    g.strokeCircle(cx, cy, radius * 0.57);
    g.fillStyle(0xe7bd6e, alpha);
    g.fillCircle(cx, cy, Math.max(2, this.tileSize * 0.08));
  }

  private paintPlayer(): void {
    const g = this.graphics;
    const cx = this.px(this.player.x) + this.tileSize / 2;
    const cy = this.py(this.player.y) + this.tileSize / 2;
    const radius = this.tileSize * 0.31;
    g.fillStyle(0x7dd6aa, 0.2);
    g.fillCircle(cx, cy, radius * 1.9);
    g.fillStyle(0x87dbb2, 1);
    g.fillCircle(cx, cy, radius);
    g.lineStyle(2, 0xd6f5d9, 0.9);
    g.strokeCircle(cx, cy, radius);
    g.fillStyle(0x263d34, 1);
    g.fillCircle(cx, cy, radius * 0.3);
  }

  private px(x: number): number {
    return this.offsetX + x * this.tileSize;
  }

  private py(y: number): number {
    return this.offsetY + y * this.tileSize;
  }
}
