export type ItemDefinition = {
  name: string;
  kind: "potion" | "weapon";
  weight: number;
  heal?: number;
  damage?: number;
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
    icon: "⚗",
    description: "Restores 8 vitality.",
  },
  wildrootTonic: {
    name: "Wildroot tonic",
    kind: "potion",
    weight: 1,
    heal: 10,
    icon: "⚗",
    description: "Restores 10 vitality.",
  },
  huntersEdge: {
    name: "Hunter's edge",
    kind: "weapon",
    weight: 2,
    damage: 3,
    icon: "⚔",
    description: "A well-balanced blade. 3 damage.",
  },
} satisfies Record<string, ItemDefinition>;

export const itemDropTable = [
  { item: items.wildrootTonic, weight: 70 },
  { item: items.huntersEdge, weight: 30 },
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
