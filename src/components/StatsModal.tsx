import React, { useState } from 'react';
import { X, BarChart2, Download, Upload, Cpu, Award } from 'lucide-react';
import { Card, Deck, ReviewLog } from '../types';
import { DEFAULT_FSRS_WEIGHTS, FSRSEngine } from '../services/fsrsEngine';
import { StorageService } from '../services/storage';

interface StatsModalProps {
  decks: Deck[];
  cards: Card[];
  logs: ReviewLog[];
  onClose: () => void;
  onRefreshData: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  decks,
  cards,
  logs,
  onClose,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'fsrs' | 'backup'>('analytics');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const totalDecks = decks.length;
  const totalCards = cards.length;
  const newCards = cards.filter((c) => c.state === 'new').length;
  const learningCards = cards.filter((c) => c.state === 'learning').length;
  const reviewCards = cards.filter((c) => c.state === 'review').length;

  const matureCards = cards.filter((c) => c.stability >= 21).length;
  const youngCards = cards.filter((c) => c.state === 'review' && c.stability < 21).length;

  const avgStability =
    reviewCards > 0
      ? (
          cards
            .filter((c) => c.state === 'review')
            .reduce((acc, c) => acc + c.stability, 0) / reviewCards
        ).toFixed(1)
      : '0.0';

  const avgDifficulty =
    totalCards > 0
      ? (cards.reduce((acc, c) => acc + c.difficulty, 0) / totalCards).toFixed(1)
      : '5.0';

  const fsrs = new FSRSEngine();
  const curvePoints = fsrs.generateCurveData(parseFloat(avgStability) || 5, 30);

  const handleExport = () => {
    const dataStr = StorageService.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapse-flashcards-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importData(content);
      if (success) {
        setImportStatus('Decks and cards imported successfully!');
        onRefreshData();
      } else {
        setImportStatus('Failed to parse backup JSON. Invalid structure.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-panel"
        style={{ maxWidth: '720px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BarChart2 size={22} style={{ color: 'var(--accent-cyan)' }} />
            <h3 className="modal-title">Memory Science & FSRS Analytics</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="tabs-group" style={{ marginBottom: '1.5rem' }}>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <Award size={15} /> Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'fsrs' ? 'active' : ''}`}
            onClick={() => setActiveTab('fsrs')}
          >
            <Cpu size={15} /> FSRS Engine
          </button>
          <button
            className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            <Download size={15} /> Backup & Sync
          </button>
        </div>

        {activeTab === 'analytics' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
                  {totalCards}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Cards
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  {matureCards}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Mature (S ≥ 21d)
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-violet)' }}>
                  {avgStability}d
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Avg Stability
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                  {avgDifficulty}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Avg Difficulty
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Forgetting Curve Model R(t) for Stability = {avgStability}d
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  Target: 90%
                </span>
              </div>

              <svg viewBox="0 0 500 150" style={{ width: '100%', height: '140px', overflow: 'visible' }}>
                <line
                  x1="30"
                  y1={150 - 90 * 1.3}
                  x2="480"
                  y2={150 - 90 * 1.3}
                  stroke="rgba(0, 240, 255, 0.3)"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />
                <text
                  x="485"
                  y={150 - 90 * 1.3 + 4}
                  fill="var(--accent-cyan)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  90%
                </text>

                <path
                  d={`M ${curvePoints
                    .map(
                      (p) =>
                        `${30 + (p.day / 30) * 440},${150 - (p.retrievability / 100) * 130}`
                    )
                    .join(' L ')}`}
                  fill="none"
                  stroke="var(--accent-violet)"
                  strokeWidth="3"
                />

                <line x1="30" y1="140" x2="470" y2="140" stroke="rgba(255,255,255,0.15)" />
                <text x="30" y="152" fill="var(--text-muted)" fontSize="9">Day 0</text>
                <text x="240" y="152" fill="var(--text-muted)" fontSize="9">Day 15</text>
                <text x="460" y="152" fill="var(--text-muted)" fontSize="9">Day 30</text>
              </svg>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', padding: '1rem', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Queue Breakdown ({totalDecks} Decks)
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 600, flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>{newCards} New</span>
                  <span style={{ color: 'var(--accent-amber)' }}>{learningCards} Learning</span>
                  <span style={{ color: 'var(--accent-emerald)' }}>{youngCards} Young</span>
                  <span style={{ color: 'var(--accent-violet)' }}>{matureCards} Mature</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '180px', padding: '1rem', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  All-time Reviews Logged
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {logs.length} reviews
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fsrs' && (
          <div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              This web app runs the <strong>FSRS v6.1</strong> scheduling engine directly in TypeScript, ported from the official <code>fsrs4anki_scheduler.js</code> in the <code>fsrs4anki/</code> directory.
            </p>

            <div
              style={{
                background: 'rgba(0,0,0,0.4)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: '#38bdf8',
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {DEFAULT_FSRS_WEIGHTS.map((weight, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.2rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>w[{i}]</span>
                  <span style={{ fontWeight: 600 }}>{weight}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Weights can be optimized for individual learning logs via PyTorch using the included <code>fsrs4anki/fsrs4anki_optimizer.ipynb</code>.
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Export Data (JSON)
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Download an offline backup file containing all your flashcard decks, cards, and spaced repetition review history.
                </p>
                <button className="btn btn-secondary" onClick={handleExport}>
                  <Download size={16} /> Download JSON Backup
                </button>
              </div>

              <div
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Restore / Import Data
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Restore decks and review history from a previously exported Synapse JSON file.
                </p>
                <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                  <Upload size={16} /> Select Backup File
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </label>
                {importStatus && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      fontSize: '0.85rem',
                      color: importStatus.includes('success') ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                    }}
                  >
                    {importStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
