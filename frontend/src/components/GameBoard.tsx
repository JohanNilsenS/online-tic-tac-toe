import React from 'react';
import type { GameSession } from '../types';
import Chat from './Chat';
import './GameBoard.css';

interface GameBoardProps {
  session: GameSession;
  playerName: string;
  appState: 'waiting' | 'playing' | 'finished';
  onMakeMove: (row: number, col: number) => void;
  onRestartGame: () => void;
  onSendChatMessage: (message: string) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  session,
  playerName,
  appState,
  onMakeMove,
  onRestartGame,
  onSendChatMessage,
}) => {
  const currentPlayer = session.players.find(p => p.name === playerName);
  const opponent = session.players.find(p => p.name !== playerName);
  
  // Handle edge case where player data might be inconsistent during reconnection
  const isMyTurn = currentPlayer && session.game_state.current_player === currentPlayer.symbol;
  const canMakeMove = appState === 'playing' && isMyTurn && !session.game_state.game_over;

  const handleCellClick = (row: number, col: number) => {
    if (canMakeMove && session.game_state.board[row][col] === '') {
      onMakeMove(row, col);
    }
  };

  const renderCell = (row: number, col: number) => {
    const cellValue = session.game_state.board[row][col];
    const isEmpty = cellValue === '';
    const isClickable = canMakeMove && isEmpty;

    return (
      <button
        key={`${row}-${col}`}
        className={`game-cell ${isEmpty ? 'empty' : 'filled'} ${isClickable ? 'clickable' : ''}`}
        onClick={() => handleCellClick(row, col)}
        disabled={!isClickable}
      >
        {cellValue && (
          <span className={`symbol ${cellValue.toLowerCase()}`}>
            {cellValue}
          </span>
        )}
      </button>
    );
  };

  const getGameStatusMessage = () => {
    if (appState === 'waiting') {
      return session.players.length === 1 
        ? '⏳ Waiting for another player to join...' 
        : '🎮 Game starting...';
    }

    if (session.game_state.game_over) {
      if (session.game_state.is_draw) {
        return '🤝 It\'s a draw!';
      }
      
      const winner = session.players.find(p => p.symbol === session.game_state.winner);
      if (winner?.name === playerName) {
        return '🎉 You won!';
      } else {
        return `😔 ${winner?.name} won!`;
      }
    }

    if (isMyTurn) {
      return '✨ Your turn!';
    } else {
      return `⏰ ${opponent?.name || 'Opponent'}'s turn`;
    }
  };

  return (
    <div className="game-board">
      <div className="game-header">
        <div className="players-info">
          <div className={`player-card ${currentPlayer?.symbol === 'X' ? 'x-player' : 'o-player'}`}>
            <span className="player-name">You ({currentPlayer?.symbol})</span>
            <span className="player-status">
              {playerName}
              {isMyTurn && !session.game_state.game_over && ' 🎯'}
            </span>
          </div>
          
          <div className="vs-divider">VS</div>
          
          <div className={`player-card ${opponent?.symbol === 'X' ? 'x-player' : 'o-player'}`}>
            <span className="player-name">
              {opponent ? `${opponent.name} (${opponent.symbol})` : 'Waiting...'}
            </span>
            <span className="player-status">
              {opponent?.name || 'No opponent yet'}
              {!isMyTurn && !session.game_state.game_over && opponent && ' 🎯'}
            </span>
          </div>
        </div>

        <div className="game-status">
          <h2>{getGameStatusMessage()}</h2>
        </div>
      </div>

      <div className="board-container">
        <div className="board">
          {[0, 1, 2].map(row => (
            <div key={row} className="board-row">
              {[0, 1, 2].map(col => renderCell(row, col))}
            </div>
          ))}
        </div>
      </div>

      {session.game_state.game_over && (
        <div className="game-actions">
          <button 
            onClick={onRestartGame} 
            className="restart-btn"
          >
            🔄 Play Again
          </button>
        </div>
      )}

      <div className="game-info">
        <div className="session-details">
          <p><strong>Session ID:</strong> {session.id}</p>
          <p><strong>Status:</strong> {session.status}</p>
          <p><strong>Players:</strong> {session.players.length}/2</p>
        </div>

        {appState === 'waiting' && session.players.length === 1 && (
          <div className="invite-info">
            <h3>🔗 Invite a Friend</h3>
            <p>Share this session ID: <strong>{session.id}</strong></p>
            {session.password && (
              <p>Password: <strong>{session.password}</strong></p>
            )}
          </div>
        )}
      </div>

      {/* Waiting for Player Modal */}
      {appState === 'waiting' && session.players.length === 1 && (
        <div className="waiting-modal">
          <div className="waiting-content">
            <div className="waiting-spinner">
              <div className="spinner"></div>
            </div>
            <h2>⏳ Waiting for Player...</h2>
            <p>Share your session details with a friend to start playing!</p>
            <div className="session-share">
              <div className="share-item">
                <label>Session ID:</label>
                <div className="session-id-display">
                  <span>{session.id}</span>
                  <button 
                    onClick={() => navigator.clipboard?.writeText(session.id)}
                    className="copy-btn"
                    title="Copy Session ID"
                  >
                    📋
                  </button>
                </div>
              </div>
              {session.password && (
                <div className="share-item">
                  <label>Password:</label>
                  <div className="password-display">
                    <span>{session.password}</span>
                    <button 
                      onClick={() => navigator.clipboard?.writeText(session.password || '')}
                      className="copy-btn"
                      title="Copy Password"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="waiting-hint">
              The game will start automatically once another player joins!
            </p>
          </div>
        </div>
      )}

      {/* Chat Component */}
      <Chat
        messages={session.chat_messages || []}
        currentPlayerName={playerName}
        onSendMessage={onSendChatMessage}
        isGameActive={appState === 'playing' || appState === 'waiting'}
      />
    </div>
  );
};

export default GameBoard; 