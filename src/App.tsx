import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { DeckCard } from './components/DeckCard';
import { StudySession } from './components/StudySession';
import { CompletionCelebration } from './components/CompletionCelebration';
import { CardModal } from './components/CardModal';
import { DeckModal } from './components/DeckModal';
import { StatsModal } from './components/StatsModal';
import { StorageService } from './services/storage';
import { Deck, Card, Rating, StudySessionStats } from './types';
import { Search, Sparkles, Plus, BookOpen, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>(() => StorageService.getDecks());
  const [cards, setCards] = useState<Card[]>(() => StorageService.getCards());
  const [logs, setLogs] = useState(() => StorageService.getLogs());
  const [streakData, setStreakData] = useState(() => StorageService.getStreak());

  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [activeSessionStats, setActiveSessionStats] = useState<StudySessionStats | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [cardModalState, setCardModalState] = useState<{
    isOpen: boolean;
    card?: Card | null;
    defaultDeckId?: string;
  }>({ isOpen: false });
  const [deckModalState, setDeckModalState] = useState<{
    isOpen: boolean;
    deck?: Deck | null;
  }>({ isOpen: false });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'due'>('all');

  useEffect(() => {
    StorageService.saveDecks(decks);
  }, [decks]);

  useEffect(() => {
    StorageService.saveCards(cards);
  }, [cards]);

  const refreshAllData = () => {
    setDecks(StorageService.getDecks());
    setCards(StorageService.getCards());
    setLogs(StorageService.getLogs());
    setStreakData(StorageService.getStreak());
  };

  const handleResetData = () => {
    if (confirm('Reset to default pre-loaded starter decks and cards?')) {
      StorageService.resetToDefault();
      refreshAllData();
    }
  };

  const now = new Date();
  const totalDueToday = useMemo(() => {
    return cards.filter(
      (c) => c.state === 'new' || c.state === 'learning' || (c.state === 'review' && new Date(c.due) <= now)
    ).length;
  }, [cards, now]);

  const handleStartStudy = (deckId: string) => {
    setActiveDeckId(deckId);
    setActiveSessionStats(null);
  };

  const handleUpdateCard = (updatedCard: Card, rating: Rating) => {
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    StorageService.logReview(updatedCard, rating);
    setLogs(StorageService.getLogs());
    setStreakData(StorageService.getStreak());
  };

  const handleSessionComplete = (stats: StudySessionStats) => {
    setActiveSessionStats(stats);
  };

  const handleSaveCard = (cardData: Partial<Card>) => {
    if (cardData.id) {
      setCards((prev) =>
        prev.map((c) => (c.id === cardData.id ? ({ ...c, ...cardData } as Card) : c))
      );
    } else {
      const newCard: Card = {
        id: 'card-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        deckId: cardData.deckId || decks[0]?.id || 'default',
        front: cardData.front || '',
        back: cardData.back || '',
        hint: cardData.hint,
        tags: cardData.tags || [],
        state: 'new',
        due: new Date().toISOString(),
        stability: 0.2,
        difficulty: 5.0,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 0,
        lapses: 0,
        createdAt: new Date().toISOString(),
      };
      setCards((prev) => [...prev, newCard]);
    }
  };

  const handleSaveDeck = (deckData: Partial<Deck>) => {
    if (deckData.id) {
      setDecks((prev) =>
        prev.map((d) => (d.id === deckData.id ? ({ ...d, ...deckData } as Deck) : d))
      );
    } else {
      const newDeck: Deck = {
        id: 'deck-' + Date.now(),
        name: deckData.name || 'New Deck',
        description: deckData.description || '',
        color: deckData.color || '#00f0ff',
        icon: 'Layers',
        requestRetention: deckData.requestRetention || 0.9,
        maximumInterval: deckData.maximumInterval || 36500,
        createdAt: new Date().toISOString(),
      };
      setDecks((prev) => [...prev, newDeck]);
    }
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    setCards((prev) => prev.filter((c) => c.deckId !== deckId));
  };

  const activeDeck = useMemo(() => {
    return decks.find((d) => d.id === activeDeckId) || null;
  }, [decks, activeDeckId]);

  const cardsForActiveSession = useMemo(() => {
    if (!activeDeckId) return [];
    const deckCards = cards.filter((c) => c.deckId === activeDeckId);
    const dueCards = deckCards.filter(
      (c) => c.state === 'new' || c.state === 'learning' || (c.state === 'review' && new Date(c.due) <= now)
    );
    return dueCards.length > 0 ? dueCards : deckCards;
  }, [cards, activeDeckId, now]);

  const filteredDecks = useMemo(() => {
    return decks.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterMode === 'due') {
        const hasDueCards = cards.some(
          (c) =>
            c.deckId === d.id &&
            (c.state === 'new' || c.state === 'learning' || (c.state === 'review' && new Date(c.due) <= now))
        );
        return hasDueCards;
      }
      return true;
    });
  }, [decks, cards, searchQuery, filterMode, now]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        streak={streakData.currentStreak}
        totalDueToday={totalDueToday}
        onOpenStats={() => setIsStatsOpen(true)}
        onNewDeck={() => setDeckModalState({ isOpen: true })}
        onNewCard={() => setCardModalState({ isOpen: true })}
        onResetData={handleResetData}
        onGoHome={() => {
          setActiveDeckId(null);
          setActiveSessionStats(null);
        }}
      />

      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeDeck && activeSessionStats ? (
          <CompletionCelebration
            deckTitle={activeDeck.name}
            stats={activeSessionStats}
            onRestart={() => setActiveSessionStats(null)}
            onBackToDecks={() => {
              setActiveDeckId(null);
              setActiveSessionStats(null);
            }}
          />
        ) : activeDeck ? (
          <StudySession
            deck={activeDeck}
            cards={cardsForActiveSession}
            onComplete={handleSessionComplete}
            onExit={() => setActiveDeckId(null)}
            onUpdateCard={handleUpdateCard}
          />
        ) : (
          <div className="container">
            <section className="hero-header">
              <div className="hero-pill">
                <Sparkles size={14} /> Powered by Free Spaced Repetition Scheduler (FSRS)
              </div>
              <h1 className="hero-title">
                Master Knowledge with <span className="hero-gradient-text">Cognitive Precision</span>
              </h1>
              <p className="hero-subtitle">
                Scientifically calculated review intervals optimize your memory retention.
                Spend 50% less time reviewing while retaining 90%+ long-term memory.
              </p>
            </section>

            <div className="dashboard-bar">
              <div className="tabs-group">
                <button
                  className={`tab-btn ${filterMode === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterMode('all')}
                >
                  <Layers size={15} /> All Decks ({decks.length})
                </button>
                <button
                  className={`tab-btn ${filterMode === 'due' ? 'active' : ''}`}
                  onClick={() => setFilterMode('due')}
                >
                  <BookOpen size={15} /> Due Today ({totalDueToday})
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.4rem 0.85rem',
                  gap: '0.5rem',
                  maxWidth: '300px',
                  width: '100%',
                }}
              >
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search decks or cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-main)',
                    fontSize: '0.88rem',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {filteredDecks.length > 0 ? (
              <div className="deck-grid">
                {filteredDecks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    cards={cards}
                    onStudy={handleStartStudy}
                    onAddCard={(dId) => setCardModalState({ isOpen: true, defaultDeckId: dId })}
                    onEditDeck={(d) => setDeckModalState({ isOpen: true, deck: d })}
                    onDeleteDeck={handleDeleteDeck}
                  />
                ))}
              </div>
            ) : (
              <div
                className="glass-panel"
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  maxWidth: '500px',
                  margin: '2rem auto',
                }}
              >
                <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No decks match your filter</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Create a custom deck or reload starter flashcard sets.
                </p>
                <button className="btn btn-primary" onClick={() => setDeckModalState({ isOpen: true })}>
                  <Plus size={16} /> Create Deck
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.5rem 0',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}
      >
        <div className="container">
          Synapse Spaced Repetition · Powered by{' '}
          <a
            href="https://github.com/open-spaced-repetition/fsrs4anki"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}
          >
            FSRS4Anki v6
          </a>{' '}
          cognitive scheduling algorithm
        </div>
      </footer>

      {cardModalState.isOpen && (
        <CardModal
          card={cardModalState.card}
          decks={decks}
          defaultDeckId={cardModalState.defaultDeckId}
          onSave={handleSaveCard}
          onClose={() => setCardModalState({ isOpen: false, card: null })}
        />
      )}

      {deckModalState.isOpen && (
        <DeckModal
          deck={deckModalState.deck}
          onSave={handleSaveDeck}
          onClose={() => setDeckModalState({ isOpen: false, deck: null })}
        />
      )}

      {isStatsOpen && (
        <StatsModal
          decks={decks}
          cards={cards}
          logs={logs}
          onClose={() => setIsStatsOpen(false)}
          onRefreshData={refreshAllData}
        />
      )}
    </div>
  );
};
