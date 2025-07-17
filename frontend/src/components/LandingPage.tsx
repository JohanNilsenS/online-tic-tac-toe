import { useState, useEffect } from 'react';
import type { SessionSummary } from '../types';
import './LandingPage.css';

interface LandingPageProps {
  onCreateSession: (name: string, password?: string) => void;
  onJoinSession: (sessionId: string, name: string, password?: string) => void;
  activeSessions: SessionSummary[];
  onRefreshSessions: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onCreateSession,
  onJoinSession,
  activeSessions,
  onRefreshSessions,
}) => {
  const [playerName, setPlayerName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'browse'>('create');
  const [sessionId, setSessionId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [createPassword, setCreatePassword] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);

  useEffect(() => {
    // Load sessions when component mounts
    onRefreshSessions();
  }, [onRefreshSessions]);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateSession(playerName.trim(), createPassword || undefined);
    }
  };

  const handleJoinById = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && sessionId.trim()) {
      onJoinSession(sessionId.trim(), playerName.trim(), password || undefined);
    }
  };

  const handleJoinFromList = (session: SessionSummary) => {
    if (!playerName.trim()) {
      return;
    }
    
    if (session.has_password && !password) {
      setSelectedSession(session);
      return;
    }
    
    // Clear any existing password state before joining
    const sessionPassword = session.has_password ? password : undefined;
    onJoinSession(session.id, playerName.trim(), sessionPassword);
    
    // Reset password after attempting to join
    setPassword('');
  };

  const handleJoinWithPassword = () => {
    if (selectedSession && playerName.trim()) {
      onJoinSession(selectedSession.id, playerName.trim(), password || undefined);
      setSelectedSession(null);
      setPassword('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="landing-page">
      <div className="player-section">
        <h2>👤 Enter Your Name</h2>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onBlur={() => {
            const trimmedName = playerName.trim();
            if (trimmedName) {
              setPlayerName(trimmedName);
            }
          }}
          placeholder="Enter your name..."
          className="player-name-input"
          maxLength={20}
          required
        />
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('create');
            setPassword('');
            setSelectedSession(null);
          }}
        >
          Create Session
        </button>
        <button
          className={`tab ${activeTab === 'join' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('join');
            setSelectedSession(null);
          }}
        >
          Join by ID
        </button>
        <button
          className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('browse');
            setPassword('');
            setSelectedSession(null);
            onRefreshSessions();
          }}
        >
          Browse Sessions ({activeSessions.filter(session => session.creator.toLowerCase() !== playerName.toLowerCase()).length})
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="tab-content">
          <h3>🎮 Create New Session</h3>
          <form onSubmit={handleCreateSession} className="form">
            <div className="input-group">
              <label htmlFor="create-password">Password (optional):</label>
              <input
                id="create-password"
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Leave empty for public session"
                maxLength={50}
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="action-btn create-btn"
            >
              Create Session
            </button>
          </form>
        </div>
      )}

      {activeTab === 'join' && (
        <div className="tab-content">
          <h3>🔗 Join by Session ID</h3>
          <form onSubmit={handleJoinById} className="form">
            <div className="input-group">
              <label htmlFor="session-id">Session ID:</label>
              <input
                id="session-id"
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID..."
                maxLength={8}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="join-password">Password (if required):</label>
              <input
                id="join-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password if session is protected"
                maxLength={50}
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim() || !sessionId.trim()}
              className="action-btn join-btn"
            >
              Join Session
            </button>
          </form>
        </div>
      )}

      {activeTab === 'browse' && (
        <div className="tab-content">
          <div className="sessions-header">
            <h3>🏠 Active Sessions</h3>
            <button onClick={onRefreshSessions} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>

          {activeSessions.length === 0 ? (
            <div className="no-sessions">
              <p>No active sessions found.</p>
              <p>Create a new session to get started!</p>
            </div>
          ) : (
            <div className="sessions-list">
              {activeSessions
                .filter(session => session.creator.toLowerCase() !== playerName.toLowerCase())
                .map((session) => (
                <div key={session.id} className="session-item">
                  <div className="session-info">
                    <div className="session-header">
                      <span className="session-id">#{session.id}</span>
                      <span className={`session-status ${session.status}`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="session-details">
                      <span className="creator">Created by: {session.creator}</span>
                      <span className="players">
                        Players: {session.player_count}/2
                      </span>
                      <span className="time">
                        Created: {formatDate(session.created_at)}
                      </span>
                    </div>
                    {session.has_password && (
                      <div className="password-indicator">🔒 Password protected</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleJoinFromList(session)}
                    disabled={!playerName.trim() || session.player_count >= 2}
                    className="join-session-btn"
                  >
                    {session.player_count >= 2 ? 'Full' : 'Join'}
                  </button>
                </div>
              ))}
              {activeSessions.filter(session => session.creator.toLowerCase() !== playerName.toLowerCase()).length === 0 && (
                <div className="no-sessions">
                  <p>No joinable sessions found.</p>
                  <p>Create a new session to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedSession && (
        <div className="password-modal">
          <div className="modal-content">
            <h3>🔒 Password Required</h3>
            <p>Session "{selectedSession.id}" requires a password:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="password-input"
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={handleJoinWithPassword} className="join-btn">
                Join
              </button>
              <button
                onClick={() => {
                  setSelectedSession(null);
                  setPassword('');
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage; 