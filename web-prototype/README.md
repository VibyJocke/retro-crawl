# Retro Crawl — Web Prototype

A self-contained browser reimagining of the Kotlin/Swing dungeon crawler in the
repository root. This is a prototype, not a port: it uses Phaser 3 for the
dungeon map and TypeScript for the game and UI logic.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite for development. To create a static
production build:

```sh
npm run build
```

## Prototype loop

- Choose a delver name and one of three starting archetypes.
- Explore a procedurally arranged four-floor dungeon, revealing the map as you go.
- Search for a concealed room, solve a rune sequence, disarm traps, and unlock caches.
- Find floor-specific events, choose a shrine blessing, and challenge an optional warden.
- Fight floor-specific creatures, strike, spend healing tonics, or try to retreat.
- Gain experience, level up, find supplies, equip a better weapon, and descend.
- Defeat the Hollow King at the bottom and return to the surface, or start another run.

Use the arrow keys or WASD to move, E to interact with nearby features, Space to
attack, and the on-screen controls on smaller screens. At each descent, choose
between a safe rest and a risky search for extra loot. This prototype does not
persist runs between page loads.
