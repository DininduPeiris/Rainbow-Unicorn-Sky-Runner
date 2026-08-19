# 🦄 Rainbow Unicorn Sky Runner

> **JS13kGames Competition Entry**  
> **Theme**: *Unicorns and Rainbows*  
> **Zip Size Budget**: **9.38 KiB / 13.00 KiB** (72.2% used)

![JS13k Games Entry](https://img.shields.io/badge/JS13kGames-2026-ff4081?style=for-the-badge&logo=javascript)
![Zip Size](https://img.shields.io/badge/Zip_Size-9.38_KiB-00e5ff?style=for-the-badge)
![Zero Assets](https://img.shields.io/badge/Assets-100%25_Procedural-ffd700?style=for-the-badge)

---

## 🌟 Overview

**Rainbow Unicorn Sky Runner** is a fast-paced, high-juice infinite runner game built specifically for the **js13kGames** challenge. All visual assets (Unicorn character, curved undulating rainbow highway, starry parallax sky, glowing obstacles, star gems, particle explosions) and audio assets (jump chimes, collect bells, crash explosions, chiptune soundtrack) are **100% procedurally synthesized in pure JavaScript code** with **zero external image or audio files**.

---

## 🎮 How to Play

Gallop along an infinite curved rainbow bridge in the sky! Jump over hazardous storm clouds and void skulls while collecting golden star gems, magic donuts, and protective shield crystals.

### 🕹️ Controls

| Action | Desktop Keyboard | Mobile Touch |
| :--- | :--- | :--- |
| **Jump** | `Space` / `Up Arrow` / `W` | Tap Screen |
| **Double Jump** | Press `Jump` twice in mid-air | Tap twice in mid-air |
| **Fast Fall / Duck** | `Down Arrow` / `S` | Swipe Down |
| **Mute / Unmute** | Click Sound Toggle (bottom right) | Tap Sound Button |

---

## ✨ Features

- **🌈 Dynamic Undulating Rainbow Highway**: 7-band HSL ribbon track oscillating with real-time sine wave physics.
- **✨ Procedural Particle FX**: Sparkle explosions, rainbow hoof trails, mid-air double-jump dust, floating score popups, and screen shake.
- **🦄 Animated Unicorn Character**: Flowing rainbow mane & tail, running legs animation, double-jump squash & stretch physics, and a glowing magical horn.
- **🔊 100% Procedural Web Audio API Synth**:
  - Jump & double-jump arpeggios
  - 3-tone chime for collecting gems
  - Low-pass filtered noise buffer for crash explosions
  - Procedural chiptune melody & bassline loop synthesizer
- **🛡️ Collectibles & Obstacles**:
  - **Star Gems**: +100 pts x Combo
  - **Magic Donuts**: +250 pts + Combo boost
  - **Shield Crystals**: Grants a 5-second protective rainbow bubble that absorbs 1 hit
  - **Storm Clouds**: Lightning crackle floating obstacle
  - **Shadow Skulls**: Dark void orb obstacle
- **🏆 High Score Tracking**: Persistent high scores saved in `localStorage`.

---

## 📦 Size & Build Pipeline

The project uses Vite, Terser, and custom Node build script to achieve optimal compression under the strict **13,312 Byte (13 KiB)** limit.

### Build Verification Report:
```text
==================================================
📦 JS13k Zip Package Generated: game.zip
📏 Total Zip Size : 9609 Bytes (9.38 KiB)
🎯 Size Limit     : 13312 Bytes (13.00 KiB)
📊 Budget Used    : 72.2%
💡 Remaining      : 3703 Bytes (3.62 KiB)
✅ SUCCESS: Zip is within the 13KB limit!
==================================================
```

---

## 🛠️ Development & Build Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v18+

### Setup
```bash
# Install dependencies
npm install
```

### Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start local Vite dev server on `http://localhost:5173` |
| `npm run build` | Build minified distribution & package `dist/game.zip` |
| `npm run preview` | Preview production build locally |

---

## 📁 Project Structure

```text
js13k/
├── index.html              # Responsive canvas viewport & glassmorphism UI
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite & Terser minification config
├── build-zip.js            # Node script for 13KB zip generation & size check
└── src/
    ├── main.js             # Core game loop & state manager
    ├── renderer.js         # Parallax sky, glowing moon, wavy rainbow track
    ├── unicorn.js          # Unicorn drawing, double-jump, ducking & tail FX
    ├── entities.js         # Obstacles, rewards, spawner & AABB collision logic
    ├── particles.js        # Sparkles, floating text, screen shake engine
    ├── audio.js            # Web Audio API sound FX & chiptune synth soundtrack
    └── ui.js               # HUD, modal screens & localStorage high score
```

---

## 📜 License

MIT License. Built for the js13kGames Competition.
