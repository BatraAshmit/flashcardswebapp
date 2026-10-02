import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle2, RotateCcw, ArrowLeft, Zap } from 'lucide-react';
import { StudySessionStats } from '../types';
import { soundFx } from '../services/soundFx';

interface CompletionCelebrationProps {
  deckTitle: string;
  stats: StudySessionStats;
  onRestart: () => void;
  onBackToDecks: () => void;
}

export const CompletionCelebration: React.FC<CompletionCelebrationProps> = ({
  deckTitle,
  stats,
  onRestart,
  onBackToDecks,
}) => {
  useEffect(() => {
    soundFx.playFanfare();

    const end = Date.now() + 1500;
    const colors = ['#00f0ff', '#8b5cf6', '#10b981', '#f59e0b'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const total = stats.totalReviewed || 1;
  const successfulReviews = stats.goodCount + stats.easyCount;
  const retentionScore = Math.round((successfulReviews / total) * 100);
  const xpEarned = total * 15 + successfulReviews * 10;

  const durationSec = stats.endTime
    ? Math.max(1, Math.round((stats.endTime - stats.startTime) / 1000))
    : 30;
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const timeFormatted = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="celebration-view glass-panel">
        <div className="celebration-badge">
          <Trophy size={42} />
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Deck Complete!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          All scheduled cards reviewed for <strong style={{ color: '#fff' }}>{deckTitle}</strong>.
        </p>

        <div className="celebration-stats-grid">
          <div className="stat-item">
            <span className="stat-value review">{stats.totalReviewed}</span>
            <span className="stat-label">Reviewed</span>
          </div>

          <div className="stat-item">
            <span className="stat-value new">{retentionScore}%</span>
            <span className="stat-label">Recall Rate</span>
          </div>

          <div className="stat-item">
            <span className="stat-value learning" style={{ color: 'var(--accent-amber)' }}>
              +{xpEarned}
            </span>
            <span className="stat-label">Synapse XP</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            marginBottom: '2rem',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={15} style={{ color: 'var(--accent-cyan)' }} /> Time: {timeFormatted}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={15} style={{ color: 'var(--accent-emerald)' }} />
            {stats.easyCount} Easy · {stats.goodCount} Good · {stats.againCount} Lapses
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={onRestart}>
            <RotateCcw size={16} /> Review Again
          </button>
          <button className="btn btn-primary" onClick={onBackToDecks}>
            <ArrowLeft size={16} /> Back to Decks
          </button>
        </div>
      </div>
    </div>
  );
};
