import Phaser from "phaser";
import { DungeonScene, floorName, type DungeonMap, type Point } from "./game";
import "./style.css";

type Archetype = {
  name: string;
  vitality: number;
  strength: number;
  agility: number;
  armor: number;
};

type Item = {
  id: number;
  name: string;
  kind: "potion" | "weapon";
  weight: number;
  heal?: number;
  damage?: number;
  icon: string;
  description: string;
};

type Monster = {
  name: string;
  kind: string;
  description: string;
  art: string;
  health: number;
  maxHealth: number;
  damage: number;
  xp: number;
};

const archetypes: Archetype[] = [
  { name: "Vanguard", vitality: 7, strength: 3, agility: 1, armor: 2 },
  { name: "Scout", vitality: 5, strength: 2, agility: 4, armor: 1 },
  { name: "Wayfarer", vitality: 6, strength: 3, agility: 2, armor: 1 },
];

const monstersByFloor: Monster[][] = [
  [
    { name: "Cave snake", kind: "TUNNEL STALKER", description: "It coils in the dust, tasting the air.", art: "🐍", health: 9, maxHealth: 9, damage: 3, xp: 25 },
    { name: "Rook bat", kind: "WINGED VERMIN", description: "A ragged shape drops from the ceiling.", art: "🦇", health: 7, maxHealth: 7, damage: 2, xp: 20 },
  ],
  [
    { name: "Moss wolf", kind: "PACK HUNTER", description: "Green eyes catch the light between the stones.", art: "🐺", health: 13, maxHealth: 13, damage: 4, xp: 40 },
    { name: "Hollow goblin", kind: "CAVE DWELLER", description: "It bares its teeth and raises a chipped blade.", art: "👹", health: 12, maxHealth: 12, damage: 4, xp: 45 },
  ],
  [
    { name: "Bone sentinel", kind: "RESTLESS DEAD", description: "Old armor rattles as the bones remember war.", art: "💀", health: 17, maxHealth: 17, damage: 5, xp: 65 },
    { name: "Ash wraith", kind: "UNQUIET SPIRIT", description: "A cold shape gathers out of the drifting ash.", art: "👻", health: 14, maxHealth: 14, damage: 6, xp: 70 },
  ],
  [
    { name: "The red keeper", kind: "ANCIENT HORROR", description: "Something vast stirs beneath the mountain.", art: "👺", health: 26, maxHealth: 26, damage: 8, xp: 120 },
    { name: "Deep demon", kind: "THE LAST GUARDIAN", description: "The air splits around its burning silhouette.", art: "😈", health: 30, maxHealth: 30, damage: 9, xp: 140 },
  ],
];

const $ = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Required page element #${id} was not found.`);
  return element as T;
};

type GameMode = "setup" | "exploring" | "combat" | "stairs" | "dead" | "victory";

const gameState = {
  mode: "setup" as GameMode,
  name: "Ari",
  archetype: archetypes[0],
  floor: 1,
  level: 1,
  xp: 0,
  health: 0,
  maxHealth: 0,
  armor: 1,
  weaponName: "Ironwood blade",
  weaponDamage: 2,
  weaponWeight: 2,
  items: [] as Item[],
  monster: null as Monster | null,
  map: null as DungeonMap | null,
  position: { x: 2, y: 2 } as Point,
  nextItemId: 1,
};

const modal = $("character-modal");
const nameInput = $("name-input") as HTMLInputElement;
const nameError = $("name-error");
const scene = new DungeonScene({
  onMove: (position) => onPlayerMove(position),
  onMapChange: (map) => renderMiniMap(map),
  onSpace: () => {
    if (gameState.mode === "combat") attack();
  },
});

const game = new Phaser.Game({
  type: Phaser.CANVAS,
  parent: "game",
  backgroundColor: "#101816",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: 720,
    height: 520,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
  scene: [scene],
});

const xpThresholds = [80, 200, 400, 750];
const floorFlavors = [
  "The mountain does not give up its secrets. It only gives you the chance to find them.",
  "Water remembers every name the stone has swallowed.",
  "The ash is warm. Something down here is still breathing.",
  "At the world's root, even shadows learn to fear the dark.",
];
const fieldNotes: Record<string, string[]> = {
  explore: ["The stones shift underfoot. Somewhere, water answers.", "A chill runs through the passage. You press on.", "Dust settles in the silence behind you.", "Your torchlight finds old marks in the stone."],
  stairs: ["You find a narrow stairwell winding down.", "A weathered stair descends into the lower halls.", "The air grows colder beyond the old stone steps."],
};

let selectedArchetype = archetypes[0];
let logEntries = 0;
let sortAscending = true;

function setElementText(id: string, value: string): void {
  $(id).textContent = value;
}

function show(element: HTMLElement): void {
  element.classList.remove("is-hidden");
}

function hide(element: HTMLElement): void {
  element.classList.add("is-hidden");
}

function log(message: string, kind = ""): void {
  const list = $("log-list");
  const entry = document.createElement("li");
  entry.className = `log-entry ${kind}`.trim();
  const index = document.createElement("span");
  index.className = "log-index";
  index.textContent = String(++logEntries).padStart(2, "0");
  const text = document.createElement("span");
  text.textContent = message;
  entry.append(index, text);
  list.prepend(entry);
  while (list.children.length > 5) list.lastElementChild?.remove();
}

function randomFrom<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function openCharacterModal(): void {
  scene.setLocked(true);
  nameInput.value = gameState.name || "Ari";
  nameError.classList.remove("is-visible");
  selectedArchetype = archetypes.find((archetype) => archetype.name === gameState.archetype.name) ?? archetypes[0];
  document.querySelectorAll<HTMLButtonElement>(".class-option").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.class === selectedArchetype.name);
  });
  show(modal);
  nameInput.focus();
}

function beginRun(): void {
  const name = nameInput.value.trim();
  if (!name) {
    nameError.classList.add("is-visible");
    nameInput.focus();
    return;
  }
  gameState.name = name.slice(0, 20);
  gameState.archetype = { ...selectedArchetype };
  gameState.floor = 1;
  gameState.level = 1;
  gameState.xp = 0;
  gameState.maxHealth = selectedArchetype.vitality * 4;
  gameState.health = gameState.maxHealth;
  gameState.armor = selectedArchetype.armor;
  gameState.weaponName = "Ironwood blade";
  gameState.weaponDamage = 2;
  gameState.weaponWeight = 2;
  gameState.nextItemId = 1;
  gameState.items = [
    { id: gameState.nextItemId++, name: "Small healing tonic", kind: "potion", weight: 1, heal: 8, icon: "⚗", description: "Restores 8 vitality." },
  ];
  gameState.monster = null;
  gameState.mode = "exploring";
  gameState.position = { x: 2, y: 2 };
  logEntries = 0;
  $("log-list").replaceChildren();
  hide(modal);
  hide($("battle-card"));
  hide($("stairs-card"));
  hide($("end-card"));
  scene.startRun();
  scene.setLocked(false);
  setElementText("character-name", gameState.name);
  setElementText("character-class", gameState.archetype.name.toUpperCase());
  setElementText("avatar-initials", gameState.name.slice(0, 2).toUpperCase());
  setElementText("floor-title", floorName(1));
  setElementText("flavor-text", floorFlavors[0]);
  log(`${gameState.name} enters the Mossbound Halls.`, "important");
  log("The entrance seals behind you. Find the stairwell.", "system");
  renderCharacter();
  renderInventory();
  renderFloor();
}

function renderFloor(): void {
  setElementText("floor-label", `FLOOR ${String(gameState.floor).padStart(2, "0")}`);
  setElementText("floor-number", String(gameState.floor).padStart(2, "0"));
  setElementText("floor-title", floorName(gameState.floor));
  setElementText("battle-floor", `FLOOR ${String(gameState.floor).padStart(2, "0")}`);
  setElementText("flavor-text", floorFlavors[gameState.floor - 1]);
}

function renderCharacter(): void {
  setElementText("level-number", String(gameState.level).padStart(2, "0"));
  setElementText("xp-current", String(gameState.xp));
  const nextThreshold = xpThresholds[gameState.level - 1];
  setElementText("xp-next", nextThreshold ? String(nextThreshold) : "MAX");
  setElementText("xp-next-label", nextThreshold ? "NEXT" : "MAX");
  $("xp-fill").style.width = `${nextThreshold ? Math.min(100, (gameState.xp / nextThreshold) * 100) : 100}%`;
  setElementText("health-label", `${gameState.health} / ${gameState.maxHealth}`);
  $("health-fill").style.width = `${Math.max(0, (gameState.health / gameState.maxHealth) * 100)}%`;
  $("health-fill").classList.toggle("health-low", gameState.health / gameState.maxHealth < 0.35);
  setElementText("strength-value", String(gameState.archetype.strength));
  setElementText("agility-value", String(gameState.archetype.agility));
  setElementText("armor-value", String(gameState.armor));
  setElementText("weapon-name", gameState.weaponName);
  setElementText("weapon-damage", `${gameState.weaponDamage} DMG`);
  setElementText("armor-defense", `${gameState.armor} DEF`);
  const carriedWeight = gameState.items.reduce((total, item) => total + item.weight, gameState.weaponWeight + 1);
  setElementText("weight-label", `${carriedWeight} / ${gameState.archetype.strength * 2} WT`);
  $("weight-label").classList.toggle("overweight", carriedWeight > gameState.archetype.strength * 2);
}

function renderInventory(): void {
  const list = $("inventory-list");
  list.replaceChildren();
  setElementText("inventory-count", String(gameState.items.length).padStart(2, "0"));
  const items = [...gameState.items].sort((a, b) =>
    sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
  );
  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "inventory-empty";
    empty.textContent = "Your pack is empty. Keep an eye out for supplies.";
    list.append(empty);
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "inventory-item";
    const icon = document.createElement("span");
    icon.className = `inventory-item-icon ${item.kind}`;
    icon.textContent = item.icon;
    const copy = document.createElement("span");
    copy.className = "inventory-item-copy";
    const name = document.createElement("strong");
    name.textContent = item.name;
    const description = document.createElement("span");
    description.textContent = item.description;
    copy.append(name, description);
    const action = document.createElement("button");
    action.className = "item-action";
    action.type = "button";
    action.textContent = item.kind === "potion" ? "USE" : "EQUIP";
    action.addEventListener("click", () => item.kind === "potion" ? usePotion(item) : equipWeapon(item));
    row.append(icon, copy, action);
    list.append(row);
  }
  renderCharacter();
  const potionCount = gameState.items.filter((item) => item.kind === "potion").length;
  setElementText("potion-count", String(potionCount));
  const potionButton = $("potion-button") as HTMLButtonElement;
  potionButton.disabled = potionCount === 0 || gameState.health === gameState.maxHealth;
}

function onPlayerMove(position: Point): void {
  gameState.position = position;
  setElementText("map-position", `${String(position.x).padStart(2, "0")} : ${String(position.y).padStart(2, "0")}`);
  if (gameState.map && position.x === gameState.map.exit.x && position.y === gameState.map.exit.y) {
    gameState.mode = "stairs";
    scene.setLocked(true);
    setElementText("stairs-title", gameState.floor === 4 ? "The heart of the hollow" : "The stone gives way");
    setElementText("stairs-copy", gameState.floor === 4 ? "The mountain's last secret waits below. Step into the light." : "A stairwell winds deeper into the dark.");
    $("descend-button").innerHTML = gameState.floor === 4 ? 'Claim your escape <span aria-hidden="true">→</span>' : 'Descend <span aria-hidden="true">→</span>';
    show($("stairs-card"));
    log(randomFrom(fieldNotes.stairs), "important");
    return;
  }
  if (Math.random() < 0.085 + gameState.floor * 0.012) {
    startEncounter();
  } else if (Math.random() < 0.3) {
    log(randomFrom(fieldNotes.explore));
  }
}

function renderMiniMap(map: DungeonMap): void {
  gameState.map = map;
  const canvas = $("minimap") as HTMLCanvasElement;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not create the expedition map.");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#111916";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const tileW = canvas.width / map.tiles[0].length;
  const tileH = canvas.height / map.tiles.length;
  let mapped = 0;
  let total = 0;
  map.tiles.forEach((row, y) => row.forEach((wall, x) => {
    if (x === 0 || y === 0 || x === row.length - 1 || y === map.tiles.length - 1) return;
    total++;
    if (!map.explored[y][x]) return;
    mapped++;
    context.fillStyle = wall ? "#435247" : "#778778";
    context.fillRect(x * tileW, y * tileH, Math.ceil(tileW), Math.ceil(tileH));
  }));
  if (map.explored[map.exit.y][map.exit.x]) {
    context.fillStyle = "#e0b66b";
    context.fillRect(map.exit.x * tileW, map.exit.y * tileH, Math.max(2, tileW), Math.max(2, tileH));
  }
  context.fillStyle = "#85ddb2";
  context.beginPath();
  context.arc((map.player.x + 0.5) * tileW, (map.player.y + 0.5) * tileH, Math.max(2, tileW * 0.65), 0, Math.PI * 2);
  context.fill();
  setElementText("mapped-percent", `${Math.round((mapped / total) * 100)}% MAPPED`);
  setElementText("map-position", `${String(map.player.x).padStart(2, "0")} : ${String(map.player.y).padStart(2, "0")}`);
}

function startEncounter(): void {
  gameState.mode = "combat";
  scene.setLocked(true);
  gameState.monster = { ...randomFrom(monstersByFloor[gameState.floor - 1]) };
  const monster = gameState.monster;
  setElementText("monster-name", monster.name);
  setElementText("monster-kind", monster.kind);
  setElementText("monster-description", monster.description);
  setElementText("monster-art", monster.art);
  updateMonsterHealth();
  show($("battle-card"));
  log(`${monster.name} emerges from the dark.`, "danger");
  renderInventory();
}

function updateMonsterHealth(): void {
  const monster = gameState.monster;
  if (!monster) return;
  setElementText("monster-health-text", `${Math.max(0, monster.health)} / ${monster.maxHealth}`);
  $("monster-health-fill").style.width = `${Math.max(0, (monster.health / monster.maxHealth) * 100)}%`;
}

function attack(): void {
  const monster = gameState.monster;
  if (gameState.mode !== "combat" || !monster) return;
  const damage = Math.max(1, gameState.archetype.strength + gameState.weaponDamage + Math.floor(Math.random() * 3) - 1);
  monster.health -= damage;
  log(`You strike ${monster.name} for ${damage} damage.`, "important");
  updateMonsterHealth();
  if (monster.health <= 0) {
    defeatMonster(monster);
    return;
  }
  monsterAttacks();
}

function monsterAttacks(): void {
  const monster = gameState.monster;
  if (!monster || gameState.mode !== "combat") return;
  const damage = Math.max(1, monster.damage - gameState.armor);
  gameState.health = Math.max(0, gameState.health - damage);
  log(`${monster.name} hits you for ${damage} damage.`, "danger");
  renderCharacter();
  renderInventory();
  if (gameState.health <= 0) {
    gameState.mode = "dead";
    gameState.monster = null;
    scene.setLocked(true);
    hide($("battle-card"));
    setElementText("end-eyebrow", "THE HOLLOW REMEMBERS");
    setElementText("end-title", "The dark takes you.");
    setElementText("end-copy", `${gameState.name}'s expedition ends beneath the mountain.`);
    show($("end-card"));
  }
}

function defeatMonster(monster: Monster): void {
  gameState.mode = "exploring";
  gameState.monster = null;
  hide($("battle-card"));
  scene.setLocked(false);
  gameState.xp += monster.xp;
  log(`${monster.name} falls. You gain ${monster.xp} experience.`, "success");
  while (gameState.level < 5 && gameState.xp >= xpThresholds[gameState.level - 1]) {
    gameState.xp -= xpThresholds[gameState.level - 1];
    gameState.level++;
    gameState.maxHealth += 4;
    gameState.health = Math.min(gameState.maxHealth, gameState.health + 6);
    if (gameState.level % 2 === 0) gameState.archetype.strength++;
    gameState.archetype.vitality++;
    log(`${gameState.name} reaches level ${gameState.level}. You feel stronger.`, "success");
  }
  if (Math.random() < 0.55) {
    const item: Item = Math.random() < 0.7
      ? { id: gameState.nextItemId++, name: "Wildroot tonic", kind: "potion", weight: 1, heal: 10, icon: "⚗", description: "Restores 10 vitality." }
      : { id: gameState.nextItemId++, name: "Hunter's edge", kind: "weapon", weight: 2, damage: 3, icon: "⚔", description: "A well-balanced blade. 3 damage." };
    gameState.items.push(item);
    log(`You salvage ${item.name}.`, "success");
  }
  renderCharacter();
  renderInventory();
}

function usePotion(item?: Item): void {
  const potion = item ?? gameState.items.find((candidate) => candidate.kind === "potion");
  if (!potion || potion.kind !== "potion" || gameState.health === gameState.maxHealth) return;
  gameState.health = Math.min(gameState.maxHealth, gameState.health + (potion.heal ?? 5));
  gameState.items = gameState.items.filter((candidate) => candidate.id !== potion.id);
  log(`${potion.name} restores your vitality.`, "success");
  renderCharacter();
  renderInventory();
  if (gameState.mode === "combat") monsterAttacks();
}

function equipWeapon(item: Item): void {
  if (item.kind !== "weapon" || (item.damage ?? 0) <= gameState.weaponDamage) {
    log("Your current weapon is the better choice.", "system");
    return;
  }
  gameState.items = gameState.items.filter((candidate) => candidate.id !== item.id);
  gameState.weaponName = item.name;
  gameState.weaponDamage = item.damage ?? gameState.weaponDamage;
  gameState.weaponWeight = item.weight;
  log(`You equip ${item.name}.`, "success");
  renderInventory();
}

function descend(): void {
  hide($("stairs-card"));
  if (gameState.floor === 4) {
    gameState.mode = "victory";
    scene.setLocked(true);
    setElementText("end-eyebrow", "THE HOLLOW HAS A NEW LEGEND");
    setElementText("end-title", "You found the way out.");
    setElementText("end-copy", `${gameState.name} escaped the deep with ${gameState.level} levels and ${gameState.xp} experience.`);
    show($("end-card"));
    log(`${gameState.name} returns to the surface.`, "success");
    return;
  }
  gameState.floor++;
  gameState.mode = "exploring";
  scene.buildFloor(gameState.floor);
  renderFloor();
  log(`You descend to ${floorName(gameState.floor)}.`, "important");
}

function onPlayerMoveButton(x: number, y: number): void {
  scene.moveBy(x, y);
}

document.querySelectorAll<HTMLButtonElement>(".class-option").forEach((button) => {
  button.addEventListener("click", () => {
    const selected = archetypes.find((archetype) => archetype.name === button.dataset.class);
    if (!selected) return;
    selectedArchetype = selected;
    document.querySelectorAll(".class-option").forEach((option) => option.classList.remove("is-selected"));
    button.classList.add("is-selected");
  });
});

$("begin-button").addEventListener("click", beginRun);
$("close-modal").addEventListener("click", beginRun);
nameInput.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Enter") beginRun();
});
$("new-run").addEventListener("click", openCharacterModal);
$("edit-character").addEventListener("click", openCharacterModal);
$("attack-button").addEventListener("click", attack);
$("potion-button").addEventListener("click", () => usePotion());
$("flee-button").addEventListener("click", () => {
  if (gameState.mode !== "combat") return;
  const chance = Math.min(0.8, Math.max(0.2, 0.38 + gameState.archetype.agility * 0.055 - gameState.floor * 0.045));
  if (Math.random() < chance) {
    const escaped = gameState.monster?.name ?? "the creature";
    gameState.monster = null;
    gameState.mode = "exploring";
    hide($("battle-card"));
    scene.setLocked(false);
    log(`You slip away from ${escaped}.`, "system");
  } else {
    log("You cannot find an opening to escape.", "danger");
    monsterAttacks();
  }
});
$("descend-button").addEventListener("click", descend);
document.querySelectorAll<HTMLButtonElement>('[data-action="restart"]').forEach((button) => button.addEventListener("click", openCharacterModal));
$("sort-inventory").addEventListener("click", () => {
  sortAscending = !sortAscending;
  renderInventory();
});
$("zoom-in").addEventListener("click", () => scene.zoomBy(0.1));
$("zoom-out").addEventListener("click", () => scene.zoomBy(-0.1));
document.querySelectorAll<HTMLButtonElement>("[data-move]").forEach((button) => {
  button.addEventListener("click", () => {
    const movement = button.dataset.move;
    if (!movement) return;
    const [x, y] = movement.split(",").map(Number);
    onPlayerMoveButton(x, y);
  });
});
window.addEventListener("beforeunload", () => game.destroy(true));

renderFloor();
renderCharacter();
renderInventory();
