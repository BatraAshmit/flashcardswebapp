import React from 'react';
import { Play, Plus, MoreVertical, Edit2, Trash2, Layers } from 'lucide-react';
import { Deck, Card } from '../types';

interface DeckCardProps {
  deck: Deck;
  cards: Card[];
  onStudy: (deckId: string) => void;
  onAddCard: (deckId: string) => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  cards,
  onStudy,
  onAddCard,
  onEditDeck,
  onDeleteDeck,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const now = new Date();
  const deckCards = cards.filter((c) => c.deckId === deck.id);

  const newCards = deckCards.filter((c) => c.state === 'new');
  const learningCards = deckCards.filter((c) => c.state === 'learning');
  const reviewCards = deckCards.filter((c) => c.state === 'review' && new Date(c.due) <= now);

  const totalDue = newCards.length + learningCards.length + reviewCards.length;

  return (
    <div
      className="deck-card glass-panel"
      style={{ '--deck-color': deck.color } as React.CSSProperties}
    >
      <div>
        <div className="deck-header">
          <div className="deck-icon-badge">
            <Layers size={22} />
          </div>

          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon"
              style={{ width: '32px', height: '32px' }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-glass)',
                  zIndex: 20,
                  minWidth: '150px',
                  overflow: 'hidden',
                }}
              >
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                  onClick={() => {
                    setMenuOpen(false);
                    onAddCard(deck.id);
                  }}
                >
                  <Plus size={14} /> Add Card
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                  onClick={() => {
                    setMenuOpen(false);
                    onEditDeck(deck);
                  }}
                >
                  <Edit2 size={14} /> Edit Deck
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-rose)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                  onClick={() => {
                    setMenuOpen(false);
                    if (confirm(`Delete "${deck.name}" and its ${deckCards.length} cards?`)) {
                      onDeleteDeck(deck.id);
                    }
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="deck-title">{deck.name}</h3>
        <p className="deck-desc">{deck.description || 'No description provided.'}</p>
      </div>

      <div>
        <div className="deck-stats-row">
          <div className="stat-item">
            <span className="stat-value new">{newCards.length}</span>
            <span className="stat-label">New</span>
          </div>
          <div className="stat-item">
            <span className="stat-value learning">{learningCards.length}</span>
            <span className="stat-label">Learning</span>
          </div>
          <div className="stat-item">
            <span className="stat-value review">{reviewCards.length}</span>
            <span className="stat-label">Review</span>
          </div>
        </div>

        <div className="deck-footer">
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={deckCards.length === 0}
            onClick={() => onStudy(deck.id)}
          >
            <Play size={16} fill="currentColor" />
            <span>{totalDue > 0 ? `Study (${totalDue} due)` : 'Review All'}</span>
          </button>

          <button
            className="btn btn-secondary"
            title="Add Card to this deck"
            onClick={() => onAddCard(deck.id)}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
