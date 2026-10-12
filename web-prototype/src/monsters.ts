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
