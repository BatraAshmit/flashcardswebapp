import React, { useState } from 'react';
import { X, Save, Layers, Sliders } from 'lucide-react';
import { Deck } from '../types';

interface DeckModalProps {
  deck?: Deck | null;
  onSave: (deckData: Partial<Deck>) => void;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  '#00f0ff',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#3b82f6',
];

export const DeckModal: React.FC<DeckModalProps> = ({ deck, onSave, onClose }) => {
  const [name, setName] = useState(deck?.name || '');
  const [description, setDescription] = useState(deck?.description || '');
  const [color, setColor] = useState(deck?.color || COLOR_OPTIONS[0]);
  const [retention, setRetention] = useState(deck?.requestRetention ?? 0.9);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: deck?.id,
      name: name.trim(),
      description: description.trim(),
      color,
      requestRetention: retention,
      maximumInterval: deck?.maximumInterval ?? 36500,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={20} style={{ color }} />
            <h3 className="modal-title">{deck ? 'Edit Deck' : 'Create New Deck'}</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Deck Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Distributed Systems & Microservices"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="What topics or skills does this deck help you retain?"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Theme Accent Color</label>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: color === c ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: color === c ? `0 0 12px ${c}` : 'none',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sliders size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span>FSRS Target Retention</span>
              </label>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {Math.round(retention * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="0.97"
              step="0.01"
              value={retention}
              onChange={(e) => setRetention(parseFloat(e.target.value))}
              style={{ accentColor: 'var(--accent-cyan)', width: '100%', marginTop: '0.5rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Recommended: 85% - 92%. Higher retention schedules reviews more frequently; lower retention reduces review workload.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
