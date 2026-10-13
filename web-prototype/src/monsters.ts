export type Monster = {
  name: string;
  kind: string;
  description: string;
  art: string;
  health: number;
  maxHealth: number;
  damage: number;
  xp: number;
};

export const monstersByFloor: Monster[][] = [
  [
    { name: "Cave snake", kind: "TUNNEL STALKER", description: "It coils in the dust, tasting the air.", art: "🐍", health: 9, maxHealth: 9, damage: 3, xp: 25 },
    { name: "Rook bat", kind: "WINGED VERMIN", description: "A ragged shape drops from the ceiling.", art: "🦇", health: 7, maxHealth: 7, damage: 2, xp: 20 },
    { name: "Moss crawler", kind: "WALL CREEPER", description: "Mossy claws scrape the stone like little hammers.", art: "🕷", health: 8, maxHealth: 8, damage: 3, xp: 22 },
    { name: "Cinder rat", kind: "BENEATH THE FLOOR", description: "Bright eyes gleam in the dark as it darts between ruins.", art: "🐭", health: 10, maxHealth: 10, damage: 3, xp: 28 },
  ],
  [
    { name: "Moss wolf", kind: "PACK HUNTER", description: "Green eyes catch the light between the stones.", art: "🐺", health: 13, maxHealth: 13, damage: 4, xp: 40 },
    { name: "Hollow goblin", kind: "CAVE DWELLER", description: "It bares its teeth and raises a chipped blade.", art: "👹", health: 12, maxHealth: 12, damage: 4, xp: 45 },
    { name: "Lantern skulk", kind: "SHADOW FORAGER", description: "A lantern-bearer gone wrong, drifting between torchlight and dark.", art: "🕯", health: 11, maxHealth: 11, damage: 4, xp: 38 },
    { name: "Root hound", kind: "MOSSBEAST", description: "It sniffs the cave floor and growls from the throat.", art: "🐕", health: 14, maxHealth: 14, damage: 4, xp: 48 },
  ],
  [
    { name: "Bone sentinel", kind: "RESTLESS DEAD", description: "Old armor rattles as the bones remember war.", art: "💀", health: 17, maxHealth: 17, damage: 5, xp: 65 },
    { name: "Ash wraith", kind: "UNQUIET SPIRIT", description: "A cold shape gathers out of the drifting ash.", art: "👻", health: 14, maxHealth: 14, damage: 6, xp: 70 },
    { name: "Soot scorpion", kind: "DESERT STINGER", description: "Its tail clicks with a dry, ancient impatience.", art: "🦂", health: 16, maxHealth: 16, damage: 5, xp: 68 },
    { name: "Dust revenant", kind: "LONG BURIED", description: "The air grows thick as the corpse the mountain forgot takes shape.", art: "🕸", health: 18, maxHealth: 18, damage: 6, xp: 74 },
  ],
  [
    { name: "The red keeper", kind: "ANCIENT HORROR", description: "Something vast stirs beneath the mountain.", art: "👺", health: 26, maxHealth: 26, damage: 8, xp: 120 },
    { name: "Deep demon", kind: "THE LAST GUARDIAN", description: "The air splits around its burning silhouette.", art: "😈", health: 30, maxHealth: 30, damage: 9, xp: 140 },
    { name: "Chasm titan", kind: "MOUNTAIN FEAST", description: "A towering, blind behemoth shudders at the sound of your steps.", art: "🦍", health: 28, maxHealth: 28, damage: 8, xp: 130 },
    { name: "Night maw", kind: "ABYSSAL HUNTER", description: "A pit of teeth opens in the darkness and laughs with your heartbeat.", art: "🦷", health: 32, maxHealth: 32, damage: 9, xp: 150 },
  ],
];
