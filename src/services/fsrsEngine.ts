import { Card, Rating, FSRSCardData, CardState } from '../types';

export const DEFAULT_FSRS_WEIGHTS = [
  0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001,
  1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014,
  1.8729, 0.5425, 0.0912, 0.0658, 0.1542
];

export interface FSRSOptions {
  weights?: number[];
  requestRetention?: number;
  maximumInterval?: number;
  enableFuzz?: boolean;
}

export interface SchedulingOption {
  rating: Rating;
  label: string;
  intervalDays: number;
  intervalHuman: string;
  nextCard: FSRSCardData;
  retrievability: number;
}

export class FSRSEngine {
  private w: number[];
  private requestRetention: number;
  private maximumInterval: number;
  private DECAY: number;
  private FACTOR: number;

  constructor(options: FSRSOptions = {}) {
    this.w = options.weights || DEFAULT_FSRS_WEIGHTS;
    this.requestRetention = options.requestRetention ?? 0.90;
    this.maximumInterval = options.maximumInterval ?? 36500;
    this.DECAY = -this.w[20];
    this.FACTOR = Math.pow(0.9, 1 / this.DECAY) - 1;
  }

  public getRetentionTarget(): number {
    return this.requestRetention;
  }

  public constrainDifficulty(d: number): number {
    return Math.min(Math.max(+d.toFixed(2), 1), 10);
  }

  public getRetrievability(elapsedDays: number, stability: number): number {
    if (stability <= 0) return 0;
    const r = Math.pow(1 + (this.FACTOR * Math.max(elapsedDays, 0)) / stability, this.DECAY);
    return Math.min(Math.max(r, 0), 1);
  }

  public initDifficulty(rating: Rating): number {
    const raw = this.w[4] - Math.exp(this.w[5] * (rating - 1)) + 1;
    return this.constrainDifficulty(raw);
  }

  public initStability(rating: Rating): number {
    return Math.max(this.w[rating - 1], 0.1);
  }

  public nextInterval(stability: number): number {
    const ivl = (stability / this.FACTOR) * (Math.pow(this.requestRetention, 1 / this.DECAY) - 1);
    return Math.min(Math.max(Math.round(ivl), 1), this.maximumInterval);
  }

  public nextDifficulty(d: number, rating: Rating): number {
    const delta_d = -this.w[6] * (rating - 3);
    const linearDamping = (delta_d * (10 - d)) / 9;
    const next_d = d + linearDamping;
    const meanReversion = this.w[7] * this.initDifficulty(4) + (1 - this.w[7]) * next_d;
    return this.constrainDifficulty(meanReversion);
  }

  public nextRecallStability(d: number, s: number, r: number, rating: Rating): number {
    const hardPenalty = rating === 2 ? this.w[15] : 1;
    const easyBonus = rating === 4 ? this.w[16] : 1;
    const next_s = s * (1 + Math.exp(this.w[8]) *
      (11 - d) *
      Math.pow(s, -this.w[9]) *
      (Math.exp((1 - r) * this.w[10]) - 1) *
      hardPenalty *
      easyBonus);
    return +next_s.toFixed(2);
  }

  public nextForgetStability(d: number, s: number, r: number): number {
    const sMin = s / Math.exp(this.w[17] * this.w[18]);
    const next_s = Math.min(
      this.w[11] *
        Math.pow(d, -this.w[12]) *
        (Math.pow(s + 1, this.w[13]) - 1) *
        Math.exp((1 - r) * this.w[14]),
      sMin
    );
    return +Math.max(next_s, 0.1).toFixed(2);
  }

  public nextShortTermStability(s: number, rating: Rating): number {
    let sinc = Math.exp(this.w[17] * (rating - 3 + this.w[18])) * Math.pow(s, -this.w[19]);
    if (rating >= 3) {
      sinc = Math.max(sinc, 1);
    }
    return +(s * sinc).toFixed(2);
  }

  public calculateElapsedDays(lastReviewDate?: string): number {
    if (!lastReviewDate) return 0;
    const now = new Date().getTime();
    const last = new Date(lastReviewDate).getTime();
    const diff = (now - last) / (1000 * 60 * 60 * 24);
    return Math.max(diff, 0);
  }

  public formatInterval(days: number): string {
    if (days <= 0) return '< 1m';
    if (days < 1 / 24) {
      const minutes = Math.round(days * 24 * 60);
      return `${Math.max(minutes, 1)}m`;
    }
    if (days < 1) {
      const hours = (days * 24).toFixed(1);
      return `${hours}h`;
    }
    if (days < 30) {
      return `${Math.round(days)}d`;
    }
    if (days < 365) {
      const months = (days / 30).toFixed(1);
      return `${months}mo`;
    }
    const years = (days / 365).toFixed(1);
    return `${years}y`;
  }

  public previewSchedule(card: Card, now: Date = new Date()): Record<Rating, SchedulingOption> {
    const elapsedDays = this.calculateElapsedDays(card.last_review);
    const currentRetrievability = card.state === 'new' ? 1.0 : this.getRetrievability(elapsedDays, card.stability);
    
    const ratings: Rating[] = [1, 2, 3, 4];
    const labels: Record<Rating, string> = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' };

    const result = {} as Record<Rating, SchedulingOption>;

    ratings.forEach((rating) => {
      let nextS = card.stability;
      let nextD = card.difficulty;
      let nextState: CardState = card.state;
      let intervalDays = 0;

      if (card.state === 'new') {
        nextD = this.initDifficulty(rating);
        nextS = this.initStability(rating);
        if (rating === 1) {
          nextState = 'learning';
          intervalDays = 5 / (24 * 60);
        } else if (rating === 2) {
          nextState = 'learning';
          intervalDays = 15 / (24 * 60);
        } else if (rating === 3) {
          nextState = 'review';
          intervalDays = this.nextInterval(nextS);
        } else {
          nextState = 'review';
          intervalDays = Math.max(this.nextInterval(nextS), 2);
        }
      } else if (card.state === 'learning') {
        nextD = this.nextDifficulty(card.difficulty, rating);
        nextS = this.nextShortTermStability(card.stability, rating);
        if (rating === 1) {
          nextState = 'learning';
          intervalDays = 5 / (24 * 60);
        } else if (rating === 2) {
          nextState = 'learning';
          intervalDays = 12 / (24 * 60);
        } else if (rating === 3) {
          nextState = 'review';
          intervalDays = this.nextInterval(nextS);
        } else {
          nextState = 'review';
          intervalDays = Math.max(this.nextInterval(nextS), 3);
        }
      } else {
        nextD = this.nextDifficulty(card.difficulty, rating);
        if (rating === 1) {
          nextState = 'learning';
          nextS = this.nextForgetStability(card.difficulty, card.stability, currentRetrievability);
          intervalDays = 10 / (24 * 60);
        } else {
          nextState = 'review';
          nextS = this.nextRecallStability(card.difficulty, card.stability, currentRetrievability, rating);
          const baseIvl = this.nextInterval(nextS);
          if (rating === 2) {
            intervalDays = Math.max(1, Math.round(baseIvl * 0.7));
          } else if (rating === 3) {
            intervalDays = Math.max(baseIvl, 2);
          } else {
            intervalDays = Math.max(Math.round(baseIvl * 1.3), 4);
          }
        }
      }

      const nextDueDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

      result[rating] = {
        rating,
        label: labels[rating],
        intervalDays,
        intervalHuman: this.formatInterval(intervalDays),
        retrievability: currentRetrievability,
        nextCard: {
          due: nextDueDate.toISOString(),
          stability: nextS,
          difficulty: nextD,
          elapsed_days: elapsedDays,
          scheduled_days: intervalDays,
          reps: card.reps + 1,
          lapses: rating === 1 ? card.lapses + 1 : card.lapses,
          state: nextState,
          last_review: now.toISOString()
        }
      };
    });

    return result;
  }

  public reviewCard(card: Card, rating: Rating, now: Date = new Date()): Card {
    const preview = this.previewSchedule(card, now);
    const chosen = preview[rating];
    return {
      ...card,
      ...chosen.nextCard
    };
  }

  public generateCurveData(stability: number, days: number = 30): { day: number; retrievability: number }[] {
    const points: { day: number; retrievability: number }[] = [];
    const step = Math.max(1, Math.floor(days / 20));
    for (let d = 0; d <= days; d += step) {
      points.push({
        day: d,
        retrievability: +(this.getRetrievability(d, stability) * 100).toFixed(1)
      });
    }
    return points;
  }
}
