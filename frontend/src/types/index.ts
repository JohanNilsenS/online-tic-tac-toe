export interface Player {
  name: string;
  symbol: 'X' | 'O';
  socket_id: string;
}

export interface GameState {
  board: string[][];
  current_player: 'X' | 'O';
  game_over: boolean;
  winner: string | null;
  is_draw: boolean;
}

export interface ChatMessage {
  id: string;
  player_name: string;
  message: string;
  timestamp: string;
  player_symbol: 'X' | 'O';
}

export interface GameSession {
  id: string;
  creator: string;
  password?: string;
  players: Player[];
  game_state: GameState;
  chat_messages: ChatMessage[];
  created_at: string;
  status: 'waiting' | 'playing' | 'finished';
}

export interface SessionSummary {
  id: string;
  creator: string;
  has_password: boolean;
  player_count: number;
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
}

export interface Move {
  row: number;
  col: number;
  player: string;
  symbol: 'X' | 'O';
}

export interface SocketEvents {
  // Client to server
  create_session: { player_name: string; password?: string };
  join_session: { session_id: string; player_name: string; password?: string };
  make_move: { row: number; col: number };
  get_sessions: void;
  restart_game: void;
  send_chat_message: { message: string };

  // Server to client
  connected: { status: string };
  session_created: { session_id: string; session: GameSession };
  session_joined: { session_id: string; session: GameSession };
  player_joined: { session: GameSession; new_player: string };
  player_left: { message: string; session: GameSession };
  move_made: { session: GameSession; move: Move; game_state: GameState };
  game_over: { result: string; winner: string | null; is_draw: boolean };
  game_restarted: { session: GameSession; game_state: GameState };
  sessions_list: { sessions: SessionSummary[] };
  chat_message_received: { message: ChatMessage };
  error: { message: string };
} 