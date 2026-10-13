export type ItemDefinition = {
  name: string;
  kind: "potion" | "weapon";
  weight: number;
  heal?: number;
  damage?: number;
  strengthBonus?: number;
  agilityBonus?: number;
  armorBonus?: number;
  effect?: "heal" | "rage" | "haste" | "ward";
  icon: string;
  description: string;
};

export type Item = ItemDefinition & {
  id: number;
};

export const items = {
  smallHealingTonic: {
    name: "Small healing tonic",
    kind: "potion",
    weight: 1,
    heal: 8,
    effect: "heal",
    icon: "⚗",
    description: "Restores 8 vitality.",
  },
  wildrootTonic: {
    name: "Wildroot tonic",
    kind: "potion",
    weight: 1,
    heal: 10,
    effect: "heal",
    icon: "⚗",
    description: "Restores 10 vitality.",
  },
  emberBrew: {
    name: "Ember brew",
    kind: "potion",
    weight: 1,
    strengthBonus: 2,
    effect: "rage",
    icon: "🔥",
    description: "Your attacks burn with +2 strength.",
  },
  galeTincture: {
    name: "Gale tincture",
    kind: "potion",
    weight: 1,
    agilityBonus: 2,
    effect: "haste",
    icon: "💨",
    description: "You move with +2 agility.",
  },
  wardingSalve: {
    name: "Warding salve",
    kind: "potion",
    weight: 1,
    armorBonus: 2,
    effect: "ward",
    icon: "🛡",
    description: "Your defenses harden with +2 armor.",
  },
  huntersEdge: {
    name: "Hunter's edge",
    kind: "weapon",
    weight: 2,
    damage: 3,
    icon: "⚔",
    description: "A well-balanced blade. 3 damage.",
  },
  ashwoodSpear: {
    name: "Ashwood spear",
    kind: "weapon",
    weight: 3,
    damage: 4,
    icon: "🗡",
    description: "A simple spear with a long reach. 4 damage.",
  },
  moonfangBlade: {
    name: "Moonfang blade",
    kind: "weapon",
    weight: 2,
    damage: 5,
    icon: "🗡",
    description: "Its edge hums with cold moonlight. 5 damage.",
  },
  boneCrusher: {
    name: "Bone crusher",
    kind: "weapon",
    weight: 4,
    damage: 6,
    icon: "🔨",
    description: "A brutal hammer that breaks through armor. 6 damage.",
  },
} satisfies Record<string, ItemDefinition>;

export const itemDropTable = [
  { item: items.wildrootTonic, weight: 60 },
  { item: items.smallHealingTonic, weight: 45 },
  { item: items.emberBrew, weight: 18 },
  { item: items.galeTincture, weight: 18 },
  { item: items.wardingSalve, weight: 17 },
  { item: items.huntersEdge, weight: 20 },
  { item: items.ashwoodSpear, weight: 14 },
  { item: items.moonfangBlade, weight: 7 },
  { item: items.boneCrusher, weight: 4 },
] as const;

export function randomItemDrop(): ItemDefinition {
  const totalWeight = itemDropTable.reduce((total, entry) => total + entry.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of itemDropTable) {
    roll -= entry.weight;
    if (roll < 0) return entry.item;
  }

  throw new Error("The item drop table has no selectable entries.");
}
