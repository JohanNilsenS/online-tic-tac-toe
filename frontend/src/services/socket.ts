import { io, Socket } from 'socket.io-client';
import type { GameSession, SessionSummary, GameState, Move, ChatMessage } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket) return;

    this.socket = io('http://localhost:5000', {
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.emit('disconnected');
    });

    // Game events
    this.socket.on('session_created', (data: { session_id: string; session: GameSession }) => {
      this.emit('session_created', data);
    });

    this.socket.on('session_joined', (data: { session_id: string; session: GameSession }) => {
      console.log('Received session_joined event:', data);
      this.emit('session_joined', data);
    });

    this.socket.on('player_joined', (data: { session: GameSession; new_player: string }) => {
      console.log('Received player_joined event:', data);
      this.emit('player_joined', data);
    });

    this.socket.on('player_left', (data: { message: string; session: GameSession }) => {
      this.emit('player_left', data);
    });

    this.socket.on('move_made', (data: { session: GameSession; move: Move; game_state: GameState }) => {
      this.emit('move_made', data);
    });

    this.socket.on('game_over', (data: { result: string; winner: string | null; is_draw: boolean }) => {
      this.emit('game_over', data);
    });

    this.socket.on('game_restarted', (data: { session: GameSession; game_state: GameState }) => {
      this.emit('game_restarted', data);
    });

    this.socket.on('sessions_list', (data: { sessions: SessionSummary[] }) => {
      this.emit('sessions_list', data);
    });

    this.socket.on('chat_message_received', (data: { message: ChatMessage }) => {
      this.emit('chat_message_received', data);
    });

    this.socket.on('error', (data: { message: string }) => {
      console.log('Received error event:', data);
      this.emit('error', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Event emitter methods
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Game actions
  createSession(playerName: string, password?: string) {
    if (this.socket) {
      this.socket.emit('create_session', { player_name: playerName, password });
    }
  }

  joinSession(sessionId: string, playerName: string, password?: string) {
    if (this.socket) {
      this.socket.emit('join_session', { 
        session_id: sessionId, 
        player_name: playerName, 
        password 
      });
    } else {
      console.error('Socket not connected when trying to join session');
    }
  }

  makeMove(row: number, col: number) {
    if (this.socket) {
      this.socket.emit('make_move', { row, col });
    }
  }

  getSessions() {
    if (this.socket) {
      this.socket.emit('get_sessions');
    }
  }

  restartGame() {
    if (this.socket) {
      this.socket.emit('restart_game');
    }
  }

  sendChatMessage(message: string) {
    if (this.socket) {
      this.socket.emit('send_chat_message', { message });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService(); 