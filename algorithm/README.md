# FSRS Algorithm Core

This directory contains the original **Free Spaced Repetition Scheduler (FSRS v6.1)** reference implementation from `open-spaced-repetition/fsrs4anki`.

## Mathematical Foundation

FSRS replaces traditional SM-2 heuristic multipliers with a three-component memory model:

1. **Stability ($S$)**: Time (in days) for retention probability to decline from 100% to 90%.
2. **Difficulty ($D$)**: Inherent complexity of the flashcard item ($1 \le D \le 10$).
3. **Retrievability ($R$)**: Probability of successfully recalling the card after $t$ elapsed days:
   $$R(t, S) = \left(1 + \text{FACTOR} \cdot \frac{t}{S}\right)^{\text{DECAY}}$$

## TypeScript Integration

The JavaScript logic from `fsrs4anki_scheduler.js` is directly implemented in pure TypeScript within:
👉 `src/services/fsrsEngine.ts`

This allows zero-latency memory calculations, live retrievability curves, and dynamic interval predictions directly in the browser.
