export type CardState = 'new' | 'learning' | 'review';

export type Rating = 1 | 2 | 3 | 4;
export const RatingLabels: Record<Rating, string> = {
  1: 'Again',
  2: 'Hard',
  3: 'Good',
  4: 'Easy'
};

export interface FSRSCardData {
  due: string; // ISO date string
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: CardState;
  last_review?: string;
}

export interface Card extends FSRSCardData {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  tags: string[];
  createdAt: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  requestRetention: number;
  maximumInterval: number;
  createdAt: string;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  deckId: string;
  rating: Rating;
  state: CardState;
  due: string;
  stability: number;
  difficulty: number;
  reviewedAt: string;
}

export interface StudySessionStats {
  totalReviewed: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  startTime: number;
  endTime?: number;
}
