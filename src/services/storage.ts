import { Card, Deck, ReviewLog, Rating } from '../types';

const STORAGE_KEYS = {
  DECKS: 'synapse_decks_v1',
  CARDS: 'synapse_cards_v1',
  LOGS: 'synapse_logs_v1',
  STREAK: 'synapse_streak_v1',
};

export const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-web-dev',
    name: 'Full-Stack & System Architecture',
    description: 'Master core systems, React 19, distributed protocols, and concurrency patterns.',
    color: '#00f0ff',
    icon: 'Terminal',
    requestRetention: 0.90,
    maximumInterval: 36500,
    createdAt: new Date().toISOString()
  },
  {
    id: 'deck-memory-science',
    name: 'Cognitive Science & FSRS Memory',
    description: 'Deep dive into memory consolidation, forgetting curves, and spaced repetition math.',
    color: '#8b5cf6',
    icon: 'Brain',
    requestRetention: 0.92,
    maximumInterval: 36500,
    createdAt: new Date().toISOString()
  },
  {
    id: 'deck-ts-mastery',
    name: 'TypeScript & JavaScript Internals',
    description: 'Advanced type gymnastics, the V8 event loop, and high-performance JS patterns.',
    color: '#10b981',
    icon: 'Cpu',
    requestRetention: 0.88,
    maximumInterval: 36500,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_CARDS: Card[] = [
  {
    id: 'card-1',
    deckId: 'deck-web-dev',
    front: 'What is the primary difference between **SSR** (Server-Side Rendering) and **RSC** (React Server Components)?',
    back: '• **SSR** executes on the server to output pure HTML string on the initial page load, and requires full client-side bundle download for hydration.\n\n• **RSC** execute exclusively on the server and stream a serialized component tree (virtual DOM protocol) with **zero bundle weight** shipped to the client for server-only components.',
    hint: 'Think about client bundle size and hydration.',
    tags: ['React', 'Architecture', 'Web'],
    state: 'new',
    due: new Date().toISOString(),
    stability: 0.2,
    difficulty: 5.0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'card-2',
    deckId: 'deck-web-dev',
    front: 'How does **Consistent Hashing** solve node redistribution when scaling caches up or down?',
    back: 'It arranges both caches and keys on an abstract circular **hash ring** (0 to $2^{32}-1$).\n\nWhen a node is added or removed, only keys whose hash positions fall between that node and its immediate predecessor need to be relocated (∼ K/N keys), instead of redistributing nearly 100% of keys like basic `hash(key) % N` does.',
    hint: 'Consider the circular ring and node additions.',
    tags: ['System Design', 'Caching', 'Distributed'],
    state: 'new',
    due: new Date().toISOString(),
    stability: 0.2,
    difficulty: 6.2,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'card-3',
    deckId: 'deck-web-dev',
    front: 'Explain the difference between **B-Trees** and **LSM-Trees** (Log-Structured Merge-Trees) for databases.',
    back: '• **B-Trees** (e.g. Postgres, MySQL InnoDB) organize data in balanced page nodes updated **in-place**. Optimized for **ultra-fast reads** with random I/O.\n\n• **LSM-Trees** (e.g. RocksDB, Cassandra, SQLite WAL) append all writes sequentially to an in-memory **MemTable** and flush sorted SSTables to disk with background compactions. Optimized for **massive write throughput**.',
    tags: ['Databases', 'Storage Engines'],
    state: 'new',
    due: new Date().toISOString(),
    stability: 0.2,
    difficulty: 5.8,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'card-4',
    deckId: 'deck-memory-science',
    front: 'What are the three core variables that describe memory state in the **FSRS (Free Spaced Repetition Scheduler)** model?',
    back: '1. **$S$ (Stability)**: The number of days for memory retrievability to decline from 100% to 90%.\n2. **$D$ (Difficulty)**: Inherent difficulty of the flashcard item on a continuous scale from 1 to 10.\n3. **$R$ (Retrievability)**: Probability of recalling the card at elapsed time $t$ based on the forgetting curve:\n$$R(t, S) = (1 + \\text{FACTOR} \\cdot t / S)^{\\text{DECAY}}$$',
    tags: ['FSRS', 'Memory', 'Algorithms'],
    state: 'new',
    due: new Date().toISOString(),
    stability: 0.2,
    difficulty: 4.5,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'card-5',
    deckId: 'deck-memory-science',
    front: 'Why is **Active Recall** significantly more effective than passive re-reading?',
    back: 'Active retrieval forces the brain to reconstruct neural pathways and strengthens synaptic plasticity (the **Testing Effect**).\n\nPassive re-reading creates an illusion of competence ("fluency heuristic") without forcing memory consolidation in the hippocampus.',
    tags: ['Psychology', 'Learning'],
    state: 'new',
    due: new Date().toISOString(),
    stability: 0.2,
    difficulty: 4.0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'card-6',
    deckId: 'deck-ts-mastery',
    front: 'What does the TypeScript `infer` keyword do in conditional types?',
    back: 'The `infer` keyword introduces a **type variable to be deduced** within the `extends` clause of a conditional type.\n\n```typescript\ntype Unbox<T> = T extends Promise<infer U> ? U : T;\n// Unbox<Promise<string>> resolves to string\n```',
    hint: 'Used inside `T extends ... ? ... : ...`',
    tags: ['TypeScript', 'Generics'],
    state: 'new',
    due: new Date().toISOString(),
    stability: 0.2,
    difficulty: 5.5,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    createdAt: new Date().toISOString()
  }
];

export class StorageService {
  public static getDecks(): Deck[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DECKS);
    if (!raw) {
      this.saveDecks(INITIAL_DECKS);
      return INITIAL_DECKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DECKS;
    }
  }

  public static saveDecks(decks: Deck[]) {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  }

  public static getCards(): Card[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (!raw) {
      this.saveCards(INITIAL_CARDS);
      return INITIAL_CARDS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CARDS;
    }
  }

  public static saveCards(cards: Card[]) {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }

  public static getLogs(): ReviewLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public static logReview(card: Card, rating: Rating) {
    const logs = this.getLogs();
    const newLog: ReviewLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      cardId: card.id,
      deckId: card.deckId,
      rating,
      state: card.state,
      due: card.due,
      stability: card.stability,
      difficulty: card.difficulty,
      reviewedAt: new Date().toISOString()
    };
    logs.push(newLog);
    if (logs.length > 2000) logs.splice(0, logs.length - 2000);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    this.updateStreak();
  }

  public static getStreak(): { currentStreak: number; lastActiveDate: string } {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!raw) {
      return { currentStreak: 1, lastActiveDate: new Date().toISOString().split('T')[0] };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { currentStreak: 1, lastActiveDate: new Date().toISOString().split('T')[0] };
    }
  }

  private static updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const data = this.getStreak();
    if (data.lastActiveDate === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let streak = data.currentStreak;
    if (data.lastActiveDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify({ currentStreak: streak, lastActiveDate: today }));
  }

  public static resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.DECKS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    this.saveDecks(INITIAL_DECKS);
    this.saveCards(INITIAL_CARDS);
  }

  public static exportData(): string {
    const data = {
      decks: this.getDecks(),
      cards: this.getCards(),
      logs: this.getLogs(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  }

  public static importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.decks) && Array.isArray(parsed.cards)) {
        this.saveDecks(parsed.decks);
        this.saveCards(parsed.cards);
        if (Array.isArray(parsed.logs)) {
          localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(parsed.logs));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
