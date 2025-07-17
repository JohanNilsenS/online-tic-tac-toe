import { useState, useEffect } from 'react';
import './App.css';
import { socketService } from './services/socket';
import LandingPage from './components/LandingPage';
import GameBoard from './components/GameBoard';
import type { GameSession, SessionSummary } from './types';

type AppState = 'landing' | 'waiting' | 'playing' | 'finished';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [playerName, setPlayerName] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeSessions, setActiveSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    socketService.connect();

    // Connection events
    socketService.on('connected', () => {
      setIsConnected(true);
      setError('');
    });

    socketService.on('disconnected', () => {
      setIsConnected(false);
      setError('Disconnected from server');
    });

    // Session events
    socketService.on('session_created', (data: { session_id: string; session: GameSession }) => {
      setCurrentSession(data.session);
      setAppState('waiting');
      setError('');
    });

    socketService.on('session_joined', (data: { session_id: string; session: GameSession }) => {
      console.log('App handling session_joined:', data);
      setCurrentSession(data.session);
      if (data.session.status === 'playing') {
        setAppState('playing');
      } else {
        setAppState('waiting');
      }
      setError('');
    });

    socketService.on('player_joined', (data: { session: GameSession; new_player: string }) => {
      console.log('Player joined:', data);
      setCurrentSession(data.session);
      if (data.session.status === 'playing') {
        setAppState('playing');
      }
    });

    socketService.on('player_left', (data: { message: string; session: GameSession }) => {
      console.log('Player left event:', data);
      setCurrentSession(data.session);
      setError(data.message);
      
      // If we're back to waiting state, update app state
      if (data.session.status === 'waiting') {
        setAppState('waiting');
      }
    });

    socketService.on('move_made', (data: { session: GameSession }) => {
      setCurrentSession(data.session);
    });

    socketService.on('game_over', () => {
      setAppState('finished');
    });

    socketService.on('game_restarted', (data: { session: GameSession }) => {
      setCurrentSession(data.session);
      setAppState('playing');
    });

    socketService.on('sessions_list', (data: { sessions: SessionSummary[] }) => {
      setActiveSessions(data.sessions);
    });

    socketService.on('chat_message_received', (data: { message: any }) => {
      setCurrentSession(prevSession => {
        if (!prevSession) return prevSession;
        return {
          ...prevSession,
          chat_messages: [...(prevSession.chat_messages || []), data.message]
        };
      });
    });

    socketService.on('error', (data: { message: string }) => {
      console.log('App handling error:', data);
      setError(data.message);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleCreateSession = (name: string, password?: string) => {
    setPlayerName(name);
    socketService.createSession(name, password);
  };

  const handleJoinSession = (sessionId: string, name: string, password?: string) => {
    setPlayerName(name);
    socketService.joinSession(sessionId, name, password);
  };

  const handleLeaveSession = () => {
    setCurrentSession(null);
    setAppState('landing');
    setError('');
    // Refresh sessions list when returning to landing
    setTimeout(() => {
      socketService.getSessions();
    }, 100);
  };

  const handleMakeMove = (row: number, col: number) => {
    socketService.makeMove(row, col);
  };

  const handleRestartGame = () => {
    socketService.restartGame();
  };

  const handleSendChatMessage = (message: string) => {
    socketService.sendChatMessage(message);
  };

  if (!isConnected) {
    return (
      <div className="app">
        <div className="connection-status">
          <h2>Connecting to server...</h2>
          <p>Please make sure the backend server is running on port 5000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎮 Online Tic-Tac-Toe</h1>
        {currentSession && (
          <div className="session-info">
            <span>Session: {currentSession.id}</span>
            <button onClick={handleLeaveSession} className="leave-btn">
              Leave Game
            </button>
          </div>
        )}
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <main className="app-main">
        {appState === 'landing' && (
          <LandingPage
            onCreateSession={handleCreateSession}
            onJoinSession={handleJoinSession}
            activeSessions={activeSessions}
            onRefreshSessions={() => socketService.getSessions()}
          />
        )}

        {(appState === 'waiting' || appState === 'playing' || appState === 'finished') && currentSession && (
          <GameBoard
            session={currentSession}
            playerName={playerName}
            appState={appState}
            onMakeMove={handleMakeMove}
            onRestartGame={handleRestartGame}
            onSendChatMessage={handleSendChatMessage}
          />
        )}
      </main>
    </div>
  );
}

export default App;
