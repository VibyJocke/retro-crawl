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
- Fight floor-specific creatures, strike, spend healing tonics, or try to retreat.
- Gain experience, level up, find supplies, equip a better weapon, and descend.
- Reach the bottom and return to the surface, or start another run.

Use the arrow keys or WASD to move, Space to attack, and the on-screen controls
on smaller screens. This prototype does not persist runs between page loads.
