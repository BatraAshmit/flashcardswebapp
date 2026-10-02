import React, { useState } from 'react';
import { X, Save, Sparkles } from 'lucide-react';
import { Card, Deck } from '../types';

interface CardModalProps {
  card?: Card | null;
  decks: Deck[];
  defaultDeckId?: string;
  onSave: (cardData: Partial<Card>) => void;
  onClose: () => void;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  decks,
  defaultDeckId,
  onSave,
  onClose,
}) => {
  const [deckId, setDeckId] = useState(card?.deckId || defaultDeckId || decks[0]?.id || '');
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');
  const [hint, setHint] = useState(card?.hint || '');
  const [tagsStr, setTagsStr] = useState(card?.tags.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: card?.id,
      deckId,
      front,
      back,
      hint: hint.trim() || undefined,
      tags,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-cyan)' }} />
            <h3 className="modal-title">{card ? 'Edit Flashcard' : 'Create New Flashcard'}</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Deck</label>
            <select
              className="form-select"
              value={deckId}
              onChange={(e) => setDeckId(e.target.value)}
              required
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Front (Question / Prompt)</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. What is the difference between B-Trees and LSM-Trees?"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Back (Answer & Explanation)</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. B-Trees are optimized for fast in-place reads..."
              rows={4}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hint (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Think about write amplification and append-only logs"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Databases, Storage, Architecture"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
