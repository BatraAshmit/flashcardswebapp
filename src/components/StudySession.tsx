import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, HelpCircle, Eye, Activity, ShieldCheck, Clock } from 'lucide-react';
import { Card, Deck, Rating, StudySessionStats } from '../types';
import { FSRSEngine } from '../services/fsrsEngine';
import { soundFx } from '../services/soundFx';

interface StudySessionProps {
  deck: Deck;
  cards: Card[];
  onComplete: (stats: StudySessionStats) => void;
  onExit: () => void;
  onUpdateCard: (updatedCard: Card, rating: Rating) => void;
}

export const StudySession: React.FC<StudySessionProps> = ({
  deck,
  cards,
  onComplete,
  onExit,
  onUpdateCard,
}) => {
  const [queue, setQueue] = useState<Card[]>(() => [...cards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState<StudySessionStats>({
    totalReviewed: 0,
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
    startTime: Date.now(),
  });

  const fsrs = useMemo(
    () =>
      new FSRSEngine({
        requestRetention: deck.requestRetention,
        maximumInterval: deck.maximumInterval,
      }),
    [deck.requestRetention, deck.maximumInterval]
  );

  const currentCard = queue[currentIndex];

  const preview = useMemo(() => {
    if (!currentCard) return null;
    return fsrs.previewSchedule(currentCard);
  }, [currentCard, fsrs]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      soundFx.playFlip();
      return !prev;
    });
  }, []);

  const handleRate = useCallback(
    (rating: Rating) => {
      if (!currentCard || !preview) return;

      soundFx.playRating(rating);

      const option = preview[rating];
      const updatedCard: Card = {
        ...currentCard,
        ...option.nextCard,
      };

      onUpdateCard(updatedCard, rating);

      setSessionStats((prev) => ({
        ...prev,
        totalReviewed: prev.totalReviewed + 1,
        againCount: rating === 1 ? prev.againCount + 1 : prev.againCount,
        hardCount: rating === 2 ? prev.hardCount + 1 : prev.hardCount,
        goodCount: rating === 3 ? prev.goodCount + 1 : prev.goodCount,
        easyCount: rating === 4 ? prev.easyCount + 1 : prev.easyCount,
      }));

      let nextQueue = [...queue];
      if (rating === 1) {
        nextQueue.push(updatedCard);
      }

      if (currentIndex + 1 >= nextQueue.length) {
        onComplete({
          ...sessionStats,
          totalReviewed: sessionStats.totalReviewed + 1,
          againCount: rating === 1 ? sessionStats.againCount + 1 : sessionStats.againCount,
          hardCount: rating === 2 ? sessionStats.hardCount + 1 : sessionStats.hardCount,
          goodCount: rating === 3 ? sessionStats.goodCount + 1 : sessionStats.goodCount,
          easyCount: rating === 4 ? sessionStats.easyCount + 1 : sessionStats.easyCount,
          endTime: Date.now(),
        });
      } else {
        setQueue(nextQueue);
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
        setShowHint(false);
      }
    },
    [currentCard, preview, onUpdateCard, sessionStats, queue, currentIndex, onComplete]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' && isFlipped) {
        e.preventDefault();
        handleRate(1);
      } else if (e.key === '2' && isFlipped) {
        e.preventDefault();
        handleRate(2);
      } else if (e.key === '3' && isFlipped) {
        e.preventDefault();
        handleRate(3);
      } else if (e.key === '4' && isFlipped) {
        e.preventDefault();
        handleRate(4);
      } else if (e.key.toLowerCase() === 'h') {
        setShowHint((prev) => !prev);
      } else if (e.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, isFlipped, onExit]);

  if (!currentCard) return null;

  const progressPercent = Math.round((currentIndex / queue.length) * 100);
  const remainingCount = queue.length - currentIndex;

  const currentR = Math.round(
    fsrs.getRetrievability(
      fsrs.calculateElapsedDays(currentCard.last_review),
      currentCard.stability
    ) * 100
  );

  return (
    <div className="study-view container">
      <div className="study-header">
        <button className="btn btn-ghost" onClick={onExit}>
          <ArrowLeft size={18} />
          <span>Exit Session</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>{deck.name}</h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Card {currentIndex + 1} of {queue.length} ({remainingCount} remaining)
          </span>
        </div>

        <div className="progress-track" title={`${progressPercent}% completed`}>
          <div
            className="progress-segment review"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="card-perspective" onClick={handleFlip}>
        <div className={`card-inner ${isFlipped ? 'is-flipped' : ''}`}>
          <div className="card-face card-front">
            <div className="card-top-meta">
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {currentCard.tags.map((t) => (
                  <span key={t} className="card-tag-pill">
                    #{t}
                  </span>
                ))}
              </div>
              <span className={`card-state-pill ${currentCard.state}`}>
                {currentCard.state}
              </span>
            </div>

            <div className="card-main-content">
              <div style={{ whiteSpace: 'pre-line' }}>{currentCard.front}</div>

              {currentCard.hint && showHint && (
                <div className="card-hint-box" onClick={(e) => e.stopPropagation()}>
                  <strong>💡 Hint:</strong> {currentCard.hint}
                </div>
              )}
            </div>

            <div className="card-flip-prompt">
              {currentCard.hint && !showHint && (
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(true);
                  }}
                >
                  <HelpCircle size={14} /> Show Hint <span className="key-badge">H</span>
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={16} />
                <span>Click card or press <span className="key-badge">Space</span> to reveal answer</span>
              </div>
            </div>
          </div>

          <div className="card-face card-back">
            <div className="card-top-meta">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Answer & Explanation</span>
              <span className={`card-state-pill ${currentCard.state}`}>
                {currentCard.state}
              </span>
            </div>

            <div className="card-main-content">
              <div style={{ whiteSpace: 'pre-line' }}>{currentCard.back}</div>
            </div>

            <div className="fsrs-hud" onClick={(e) => e.stopPropagation()}>
              <div className="hud-item">
                <div className="hud-icon-wrap" style={{ color: 'var(--accent-cyan)' }}>
                  <ShieldCheck size={16} />
                </div>
                <div className="hud-details">
                  <span className="hud-title">Retrievability (R)</span>
                  <span className="hud-value" style={{ color: 'var(--accent-cyan)' }}>
                    {currentCard.state === 'new' ? '100%' : `${currentR}%`}
                  </span>
                </div>
              </div>

              <div className="hud-item">
                <div className="hud-icon-wrap" style={{ color: 'var(--accent-violet)' }}>
                  <Clock size={16} />
                </div>
                <div className="hud-details">
                  <span className="hud-title">Stability (S)</span>
                  <span className="hud-value" style={{ color: 'var(--accent-violet)' }}>
                    {currentCard.stability.toFixed(1)}d
                  </span>
                </div>
              </div>

              <div className="hud-item">
                <div className="hud-icon-wrap" style={{ color: 'var(--accent-amber)' }}>
                  <Activity size={16} />
                </div>
                <div className="hud-details">
                  <span className="hud-title">Difficulty (D)</span>
                  <span className="hud-value" style={{ color: 'var(--accent-amber)' }}>
                    {currentCard.difficulty.toFixed(1)} / 10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFlipped ? (
        <div className="rating-bar">
          <button
            className="btn-rating again"
            onClick={() => handleRate(1)}
            title="Forgot this card. Reset interval."
          >
            <span className="rating-key-indicator">1</span>
            <span className="rating-name">Again</span>
            <span className="rating-interval">{preview?.[1].intervalHuman}</span>
          </button>

          <button
            className="btn-rating hard"
            onClick={() => handleRate(2)}
            title="Recalled with effort."
          >
            <span className="rating-key-indicator">2</span>
            <span className="rating-name">Hard</span>
            <span className="rating-interval">{preview?.[2].intervalHuman}</span>
          </button>

          <button
            className="btn-rating good"
            onClick={() => handleRate(3)}
            title="Good recall at standard interval."
          >
            <span className="rating-key-indicator">3</span>
            <span className="rating-name">Good</span>
            <span className="rating-interval">{preview?.[3].intervalHuman}</span>
          </button>

          <button
            className="btn-rating easy"
            onClick={() => handleRate(4)}
            title="Instant recall. Longest interval."
          >
            <span className="rating-key-indicator">4</span>
            <span className="rating-name">Easy</span>
            <span className="rating-interval">{preview?.[4].intervalHuman}</span>
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={handleFlip} style={{ minWidth: '220px' }}>
            <Eye size={18} /> Show Answer <span className="key-badge" style={{ marginLeft: '0.5rem' }}>Space</span>
          </button>
        </div>
      )}
    </div>
  );
};
