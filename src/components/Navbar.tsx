import React from 'react';
import { Zap, Flame, Volume2, VolumeX, BarChart3, Plus, RotateCcw } from 'lucide-react';
import { soundFx } from '../services/soundFx';

interface NavbarProps {
  streak: number;
  totalDueToday: number;
  onOpenStats: () => void;
  onNewDeck: () => void;
  onNewCard: () => void;
  onResetData: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  streak,
  totalDueToday,
  onOpenStats,
  onNewDeck,
  onNewCard,
  onResetData,
  onGoHome,
}) => {
  const [muted, setMuted] = React.useState(soundFx.isMuted());

  const toggleSound = () => {
    const isNowMuted = soundFx.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <header className="navbar">
      <div className="container nav-content">
        <div className="brand" onClick={onGoHome} title="Go to Deck Dashboard">
          <div className="brand-icon">
            <Zap size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">SYNAPSE</span>
              <span className="brand-badge">FSRS v6</span>
            </div>
          </div>
        </div>

        <div className="nav-actions">
          <div className="nav-stat-chip" title={`${streak} day study streak`}>
            <Flame size={16} className="streak-flame" />
            <span>{streak}d</span>
          </div>

          <div className="nav-stat-chip" title="Cards due for review today">
            <span style={{ color: 'var(--accent-cyan)' }}>●</span>
            <span>{totalDueToday} Due</span>
          </div>

          <button
            className={`btn-icon ${!muted ? 'active' : ''}`}
            onClick={toggleSound}
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            className="btn-icon"
            onClick={onOpenStats}
            title="Memory Science & Analytics"
          >
            <BarChart3 size={18} />
          </button>

          <button
            className="btn-icon"
            onClick={onResetData}
            title="Reload Default Starter Decks"
          >
            <RotateCcw size={17} />
          </button>

          <button className="btn btn-secondary" onClick={onNewCard}>
            <Plus size={16} />
            <span>Card</span>
          </button>

          <button className="btn btn-primary" onClick={onNewDeck}>
            <Plus size={16} />
            <span>Deck</span>
          </button>
        </div>
      </div>
    </header>
  );
};
