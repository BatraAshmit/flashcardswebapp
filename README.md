# Synapse // Next-Gen Spaced Repetition Flashcards

A modern, high-performance web flashcard application powered by the **Free Spaced Repetition Scheduler (FSRS v6.1)** algorithm.

Achieve **90%+ long-term retention** with scientifically optimized review intervals and 50% fewer daily reviews compared to legacy SM-2 algorithms.

![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![FSRS](https://img.shields.io/badge/Algorithm-FSRS%20v6.1-00f0ff)

---

## ⚡ Features

* **Scientific FSRS v6.1 Scheduling:**
  * Real-time calculation of **$S$ (Stability)**, **$D$ (Difficulty)**, and **$R$ (Retrievability)**.
  * Predictive interval badges on review ratings (`Again`, `Hard`, `Good`, `Easy`).
  * Custom target retention sliders (80% – 97%) per deck.
* **Futuristic 3D Study Experience:**
  * True 3D perspective card flips with smooth spring easing.
  * Live memory inspector HUD directly on the backface of each card.
  * Zero-external-dependency audio synthesizer using the Web Audio API.
  * Full keyboard shortcuts (`Space` to flip, `1-4` to rate, `H` for hint).
  * Completion celebration screen with confetti fireworks and XP tracking.
* **Deck & Card Management:**
  * Pre-loaded starter decks (*Full-Stack & System Architecture*, *Cognitive Science*, *TypeScript Mastery*).
  * Create, edit, and organize decks and cards with tags and hints.
  * Daily study streak tracker and due review queues.
* **Memory Analytics & Data Safety:**
  * Interactive SVG forgetting curve model based on average deck stability.
  * One-click offline JSON backup export and restore.
  * Local-first architecture (zero backend latency, works offline).

---

## 📁 Project Architecture

```
Flashcards/
├── algorithm/               # FSRS reference implementation
│   ├── fsrs4anki_scheduler.js
│   └── README.md
├── src/
│   ├── components/          # Next-gen UI components
│   │   ├── Navbar.tsx
│   │   ├── DeckCard.tsx
│   │   ├── StudySession.tsx
│   │   ├── CompletionCelebration.tsx
│   │   ├── CardModal.tsx
│   │   ├── DeckModal.tsx
│   │   └── StatsModal.tsx
│   ├── services/
│   │   ├── fsrsEngine.ts    # Pure TypeScript FSRS v6.1 implementation
│   │   ├── soundFx.ts       # Web Audio API synthesizer
│   │   └── storage.ts       # Local-first persistence & starter decks
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── App.tsx              # Main application shell
│   ├── index.css            # Vanilla CSS design system & 3D transforms
│   └── main.tsx             # React DOM entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

Open [http://localhost:5174/](http://localhost:5174/) in your browser.

### 3. Build for production
```bash
npm run build
```

---

## 🧠 The FSRS Algorithm

This project adapts the open-source FSRS algorithm developed by the [Open Spaced Repetition Community](https://github.com/open-spaced-repetition/fsrs4anki). FSRS models memory retention via power-law decay:

$$R(t, S) = \left(1 + \text{FACTOR} \cdot \frac{t}{S}\right)^{\text{DECAY}}$$

Where $S$ dynamically scales with recall difficulty, prior stability, and review intervals.

---

## 📄 License

MIT
