import Phaser from "phaser";
import { DungeonScene, floorName, type DungeonFeature, type DungeonMap, type Point } from "./game";
import { items, randomItemDrop, type Item } from "./items";
import { monstersByFloor, namedEncounters, type Monster } from "./monsters";
import "./style.css";

type Archetype = {
  name: string;
  vitality: number;
  strength: number;
  agility: number;
  armor: number;
};

const archetypes: Archetype[] = [
  { name: "Vanguard", vitality: 7, strength: 3, agility: 1, armor: 2 },
  { name: "Scout", vitality: 5, strength: 2, agility: 4, armor: 1 },
  { name: "Wayfarer", vitality: 5, strength: 3, agility: 3, armor: 1 },
];

const $ = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Required page element #${id} was not found.`);
  return element as T;
};

type GameMode = "setup" | "exploring" | "combat" | "event" | "stairs" | "dead" | "victory";

type TemporaryEffects = {
  strength: number;
  agility: number;
  armor: number;
};

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
  temporaryEffects: { strength: 0, agility: 0, armor: 0 } as TemporaryEffects,
  items: [] as Item[],
  monster: null as Monster | null,
  encounter: null as "random" | "warden" | "final" | null,
  map: null as DungeonMap | null,
  position: { x: 2, y: 2 } as Point,
  nextItemId: 1,
  keyCollected: false,
  runeProgress: 0,
  wardenDefeated: false,
  bossDefeated: false,
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
  onInteract: () => interact(),
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
const floorObjectives = [
  "Three numbered runes hide the key to a secret cache.",
  "Find the iron key, search for the drowned shrine, then choose your descent.",
  "The Ashen Knight guards an optional cache in the reliquary.",
  "Find the deep key if you wish. The Hollow King waits at the exit.",
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
  gameState.temporaryEffects = { strength: 0, agility: 0, armor: 0 };
  gameState.nextItemId = 1;
  gameState.items = [
    { ...items.smallHealingTonic, id: gameState.nextItemId++ },
  ];
  gameState.monster = null;
  gameState.encounter = null;
  gameState.keyCollected = false;
  gameState.runeProgress = 0;
  gameState.wardenDefeated = false;
  gameState.bossDefeated = false;
  gameState.mode = "exploring";
  gameState.position = { x: 2, y: 2 };
  logEntries = 0;
  $("log-list").replaceChildren();
  hide(modal);
  hide($("battle-card"));
  hide($("stairs-card"));
  hide($("end-card"));
  hide($("event-card"));
  $("context-hint").classList.remove("is-visible");
  scene.startRun();
  scene.setLocked(false);
  setElementText("character-name", gameState.name);
  setElementText("character-class", gameState.archetype.name.toUpperCase());
  setElementText("avatar-initials", gameState.name.slice(0, 2).toUpperCase());
  setElementText("floor-title", floorName(1));
  setElementText("flavor-text", floorFlavors[0]);
  log(`${gameState.name} enters the Mossbound Halls.`, "important");
  log("The entrance seals behind you. Find the stairwell.", "system");
  log(floorObjectives[0], "important");
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
  gameState.keyCollected = false;
  gameState.runeProgress = 0;
  gameState.wardenDefeated = false;
}

function getCarriedWeight(): number {
  return gameState.items.reduce((total, item) => total + item.weight, gameState.weaponWeight + 1);
}

function getEncumbranceLimit(): number {
  return Math.max(1, gameState.archetype.strength * 2);
}

function getEncumbrancePenalty(): number {
  const carriedWeight = getCarriedWeight();
  const limit = getEncumbranceLimit();
  if (carriedWeight <= limit) return 0;
  return Math.max(1, Math.ceil((carriedWeight - limit) / 4));
}

function getEffectiveStrength(): number {
  return gameState.archetype.strength + gameState.temporaryEffects.strength;
}

function getEffectiveArmor(): number {
  return gameState.armor + gameState.temporaryEffects.armor;
}

function getEffectiveAgility(): number {
  return Math.max(1, gameState.archetype.agility + gameState.temporaryEffects.agility - getEncumbrancePenalty());
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
  setElementText("strength-value", String(getEffectiveStrength()));
  setElementText("agility-value", String(getEffectiveAgility()));
  setElementText("armor-value", String(getEffectiveArmor()));
  setElementText("weapon-name", gameState.weaponName);
  setElementText("weapon-damage", `${gameState.weaponDamage} DMG`);
  setElementText("armor-defense", `${getEffectiveArmor()} DEF`);
  const carriedWeight = getCarriedWeight();
  const limit = getEncumbranceLimit();
  setElementText("weight-label", `${carriedWeight} / ${limit} WT`);
  $("weight-label").classList.toggle("overweight", carriedWeight > limit);
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
  const landedFeature = getFeatureAt(position);
  if (landedFeature?.kind === "trap" && landedFeature.active) {
    landedFeature.active = false;
    if (Math.random() < Math.min(0.75, getEffectiveAgility() * 0.08)) {
      log("You spot the pressure plate in time and step around it.", "success");
    } else {
      const damage = 3 + gameState.floor;
      gameState.health = Math.max(0, gameState.health - damage);
      log(`A hidden trap snaps shut. You take ${damage} damage.`, "danger");
      renderCharacter();
      if (gameState.health === 0) {
        endRun();
        return;
      }
    }
    scene.refresh();
  }
  if (landedFeature?.kind === "warden" && landedFeature.active) {
    landedFeature.active = false;
    scene.refresh();
    startEncounter({ ...namedEncounters.ashWarden }, "warden");
    return;
  }
  if (gameState.map && position.x === gameState.map.exit.x && position.y === gameState.map.exit.y) {
    if (gameState.floor === 4 && !gameState.bossDefeated) {
      startEncounter({ ...namedEncounters.hollowKing }, "final");
    } else {
      openStairs();
    }
    return;
  }
  if (Math.random() < 0.085 + gameState.floor * 0.012) {
    startEncounter();
  } else if (Math.random() < 0.3) {
    log(randomFrom(fieldNotes.explore));
  }
  updateContextHint();
}

function getFeatureAt(position: Point): DungeonFeature | undefined {
  return gameState.map?.features.find((feature) =>
    feature.position.x === position.x && feature.position.y === position.y,
  );
}

function updateContextHint(): void {
  const hint = $("context-hint");
  if (gameState.mode !== "exploring") {
    hint.textContent = "";
    hint.classList.remove("is-visible");
    return;
  }
  const door = gameState.map?.features.find((feature) => {
    return feature.kind === "secret-door" && feature.active &&
      Math.abs(feature.position.x - gameState.position.x) + Math.abs(feature.position.y - gameState.position.y) === 1;
  });
  if (door) {
    door.revealed = true;
    hint.textContent = "A hollow-sounding wall. Press E to search.";
    hint.classList.add("is-visible");
    scene.refresh();
    return;
  }

  const feature = getFeatureAt(gameState.position);
  const prompts: Partial<Record<DungeonFeature["kind"], string>> = {
    rune: `Rune ${feature?.order ?? ""}: press E to trace it`,
    cache: "A locked cache. Press E to inspect",
    key: "An old key glints here. Press E to take it",
    shrine: "A drowned shrine waits. Press E to choose",
  };
  const prompt = feature?.active ? prompts[feature.kind] : undefined;
  hint.textContent = prompt ?? "";
  hint.classList.toggle("is-visible", Boolean(prompt));
}

function interact(): void {
  if (gameState.mode !== "exploring") return;
  const door = gameState.map?.features.find((feature) =>
    feature.kind === "secret-door" && feature.active &&
    Math.abs(feature.position.x - gameState.position.x) + Math.abs(feature.position.y - gameState.position.y) === 1,
  );
  if (door) {
    scene.openSecretDoor();
    log("You find a concealed seam and push through into a forgotten chamber.", "important");
    updateContextHint();
    return;
  }

  const feature = getFeatureAt(gameState.position);
  if (!feature?.active) return;
  if (feature.kind === "rune") {
    if (feature.order === gameState.runeProgress + 1) {
      feature.active = false;
      gameState.runeProgress++;
      log(`The ${feature.order}${feature.order === 1 ? "st" : feature.order === 2 ? "nd" : "rd"} rune answers with a low chime.`, "success");
      if (gameState.runeProgress === 3) log("The three seals align. The hidden cache is unlocked.", "important");
    } else {
      gameState.runeProgress = 0;
      gameState.map?.features.filter((candidate) => candidate.kind === "rune").forEach((rune) => { rune.active = true; });
      gameState.health = Math.max(0, gameState.health - 3);
      log("The rune sequence breaks. A pulse of force deals 3 damage; the seals reset.", "danger");
      renderCharacter();
      if (gameState.health === 0) {
        endRun();
        return;
      }
    }
    scene.refresh();
  } else if (feature.kind === "key") {
    feature.active = false;
    gameState.keyCollected = true;
    log("You take the iron key. It may fit a cache nearby.", "success");
    scene.refresh();
  } else if (feature.kind === "cache") {
    const unlocked = gameState.floor === 1
      ? gameState.runeProgress === 3
      : gameState.floor === 3 ? gameState.wardenDefeated : gameState.keyCollected;
    if (!unlocked) {
      log(gameState.floor === 1 ? "Three runes must be traced in order to release the cache." : "The cache is locked. Search this floor for its key.", "system");
      return;
    }
    const reward = gameState.floor === 1 ? items.wildrootTonic
      : gameState.floor === 2 ? items.ashwoodSpear
        : gameState.floor === 3 ? items.moonfangBlade : items.boneCrusher;
    gameState.items.push({ ...reward, id: gameState.nextItemId++ });
    feature.active = false;
    log(`The cache opens. Inside: ${reward.name}.`, "success");
    renderInventory();
    scene.refresh();
  } else if (feature.kind === "shrine") {
    openShrine(feature);
  }
  updateContextHint();
}

function openShrine(feature: DungeonFeature): void {
  gameState.mode = "event";
  scene.setLocked(true);
  setElementText("event-title", "The drowned shrine");
  setElementText("event-copy", "A spirit stirs beneath the water. Choose what to take from its quiet blessing.");
  setElementText("event-choice-a", "Restore 10 vitality");
  setElementText("event-choice-b", "Gain +1 strength");
  show($("event-card"));
  $("event-choice-a").onclick = () => {
    gameState.health = Math.min(gameState.maxHealth, gameState.health + 10);
    feature.active = false;
    closeEvent("The shrine's cool water closes your wounds.");
  };
  $("event-choice-b").onclick = () => {
    gameState.temporaryEffects.strength++;
    feature.active = false;
    closeEvent("The shrine's blessing lends you +1 strength for the rest of the run.");
  };
}

function closeEvent(message: string): void {
  gameState.mode = "exploring";
  scene.setLocked(false);
  hide($("event-card"));
  log(message, "success");
  renderCharacter();
  scene.refresh();
  updateContextHint();
}

function openStairs(): void {
  gameState.mode = "stairs";
  scene.setLocked(true);
  $("context-hint").classList.remove("is-visible");
  const isFinal = gameState.floor === 4;
  setElementText("stairs-title", isFinal ? "The way home is open" : "The stone gives way");
  setElementText("stairs-copy", isFinal ? "The Hollow King is fallen. Leave the mountain with your story intact." : "Choose how to prepare before descending.");
  $("descend-button").innerHTML = isFinal ? 'Claim your escape <span aria-hidden="true">→</span>' : 'Rest and descend <span aria-hidden="true">→</span>';
  $("relic-button").classList.toggle("is-hidden", isFinal);
  show($("stairs-card"));
  log(isFinal ? "The mountain's last guardian is silent." : randomFrom(fieldNotes.stairs), "important");
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
  for (const feature of map.features) {
    const { x, y } = feature.position;
    if (!feature.active || !feature.revealed || !map.explored[y][x]) continue;
    context.fillStyle = feature.kind === "trap" ? "#d78070"
      : feature.kind === "rune" || feature.kind === "shrine" ? "#8bc4bb"
        : feature.kind === "warden" ? "#d96e59" : "#e2bb70";
    context.fillRect(x * tileW, y * tileH, Math.max(2, tileW), Math.max(2, tileH));
  }
  context.fillStyle = "#85ddb2";
  context.beginPath();
  context.arc((map.player.x + 0.5) * tileW, (map.player.y + 0.5) * tileH, Math.max(2, tileW * 0.65), 0, Math.PI * 2);
  context.fill();
  setElementText("mapped-percent", `${Math.round((mapped / total) * 100)}% MAPPED`);
  setElementText("map-position", `${String(map.player.x).padStart(2, "0")} : ${String(map.player.y).padStart(2, "0")}`);
}

function startEncounter(monsterOverride?: Monster, encounter: "random" | "warden" | "final" = "random"): void {
  gameState.mode = "combat";
  scene.setLocked(true);
  $("context-hint").classList.remove("is-visible");
  gameState.encounter = encounter;
  gameState.monster = monsterOverride ?? { ...randomFrom(monstersByFloor[gameState.floor - 1]) };
  const monster = gameState.monster;
  setElementText("monster-name", monster.name);
  setElementText("monster-kind", monster.kind);
  setElementText("monster-description", monster.description);
  setElementText("monster-art", monster.art);
  setElementText("battle-kicker", encounter === "final" ? "FINAL CONFRONTATION"
    : encounter === "warden" ? "OPTIONAL FLOOR WARDEN" : "HOSTILE ENCOUNTER");
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
  const damage = Math.max(1, getEffectiveStrength() + gameState.weaponDamage + Math.floor(Math.random() * 3) - 1);
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

  const dodgeChance = Math.min(0.75, Math.max(0.08, 0.12 + getEffectiveAgility() * 0.06 - gameState.floor * 0.015));
  if (Math.random() < dodgeChance) {
    log(`You dodge ${monster.name}'s attack.`, "success");
    renderCharacter();
    return;
  }

  const damage = Math.max(1, monster.damage - getEffectiveArmor());
  gameState.health = Math.max(0, gameState.health - damage);
  log(`${monster.name} hits you for ${damage} damage.`, "danger");
  renderCharacter();
  renderInventory();
  if (gameState.health <= 0) {
    endRun();
  }
}

function defeatMonster(monster: Monster): void {
  const encounter = gameState.encounter;
  gameState.mode = "exploring";
  gameState.monster = null;
  gameState.encounter = null;
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
  if (Math.random() < 0.35) {
    const item: Item = { ...randomItemDrop(), id: gameState.nextItemId++ };
    gameState.items.push(item);
    log(`You salvage ${item.name}.`, "success");
  }
  if (encounter === "warden") {
    gameState.wardenDefeated = true;
    log("The Ashen Knight's seal breaks. Its defeat releases the hidden cache.", "success");
  }
  if (encounter === "final") {
    gameState.bossDefeated = true;
    log("The Hollow King falls. The path to the surface is yours.", "success");
    openStairs();
  }
  renderCharacter();
  renderInventory();
  scene.refresh();
}

function usePotion(item?: Item): void {
  const potion = item ?? gameState.items.find((candidate) => candidate.kind === "potion");
  if (!potion || potion.kind !== "potion") return;

  if (potion.effect === "heal") {
    if (gameState.health === gameState.maxHealth) return;
    gameState.health = Math.min(gameState.maxHealth, gameState.health + (potion.heal ?? 5));
    log(`${potion.name} restores your vitality.`, "success");
  } else if (potion.effect === "rage") {
    gameState.temporaryEffects.strength += potion.strengthBonus ?? 0;
    log(`${potion.name} fills you with fury. Your strength rises.`, "success");
  } else if (potion.effect === "haste") {
    gameState.temporaryEffects.agility += potion.agilityBonus ?? 0;
    log(`${potion.name} quickens your steps. Your agility rises.`, "success");
  } else if (potion.effect === "ward") {
    gameState.temporaryEffects.armor += potion.armorBonus ?? 0;
    log(`${potion.name} hardens your stance. Your armor rises.`, "success");
  } else if (potion.heal) {
    if (gameState.health === gameState.maxHealth) return;
    gameState.health = Math.min(gameState.maxHealth, gameState.health + potion.heal);
    log(`${potion.name} restores your vitality.`, "success");
  }

  gameState.items = gameState.items.filter((candidate) => candidate.id !== potion.id);
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

function descend(choice: "rest" | "relic" = "rest"): void {
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
  if (choice === "rest") {
    const restored = Math.min(8, gameState.maxHealth - gameState.health);
    gameState.health += restored;
    log(`You rest before descending and recover ${restored} vitality.`, "success");
  } else {
    const reward: Item = { ...randomItemDrop(), id: gameState.nextItemId++ };
    gameState.items.push(reward);
    log(`You search the rubble and find ${reward.name}.`, "success");
    if (Math.random() < 0.35) {
      const damage = 4;
      gameState.health = Math.max(0, gameState.health - damage);
      log(`A hidden blade catches you for ${damage} damage.`, "danger");
      if (gameState.health === 0) {
        endRun();
        return;
      }
    } else {
      log("You avoid the rubble's trap.", "system");
    }
  }
  gameState.floor++;
  gameState.mode = "exploring";
  gameState.keyCollected = false;
  gameState.runeProgress = 0;
  gameState.wardenDefeated = false;
  scene.buildFloor(gameState.floor);
  scene.setLocked(false);
  renderFloor();
  renderCharacter();
  renderInventory();
  log(`You descend to ${floorName(gameState.floor)}.`, "important");
  log(floorObjectives[gameState.floor - 1], "system");
  updateContextHint();
}

function endRun(): void {
  gameState.mode = "dead";
  gameState.monster = null;
  gameState.encounter = null;
  scene.setLocked(true);
  hide($("battle-card"));
  hide($("event-card"));
  hide($("stairs-card"));
  $("context-hint").classList.remove("is-visible");
  setElementText("end-eyebrow", "THE HOLLOW REMEMBERS");
  setElementText("end-title", "The dark takes you.");
  setElementText("end-copy", `${gameState.name}'s expedition ends beneath the mountain.`);
  show($("end-card"));
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
  const chance = Math.min(0.8, Math.max(0.2, 0.38 + getEffectiveAgility() * 0.055 - gameState.floor * 0.045));
  if (Math.random() < chance) {
    const escaped = gameState.monster?.name ?? "the creature";
    const encounter = gameState.encounter;
    gameState.monster = null;
    gameState.encounter = null;
    gameState.mode = "exploring";
    hide($("battle-card"));
    scene.setLocked(false);
    if (encounter === "warden") {
      const warden = gameState.map?.features.find((feature) => feature.kind === "warden");
      if (warden) warden.active = true;
      scene.refresh();
    }
    log(`You slip away from ${escaped}.`, "system");
    updateContextHint();
  } else {
    log("You cannot find an opening to escape.", "danger");
    monsterAttacks();
  }
});
$("descend-button").addEventListener("click", () => descend());
$("relic-button").addEventListener("click", () => descend("relic"));
$("interact-button").addEventListener("click", interact);
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
