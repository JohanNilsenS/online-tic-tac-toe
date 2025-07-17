from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms
import uuid
import json
from datetime import datetime
from typing import Dict, List, Optional

import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here-change-in-production')

# CORS settings for production
cors_origins = ["*"] if os.environ.get('FLASK_ENV') == 'development' else ["https://tictac.johancv.com", "https://johancv.com"]

socketio = SocketIO(app, cors_allowed_origins=cors_origins)

# Game data structures
game_sessions: Dict[str, dict] = {}
player_sessions: Dict[str, str] = {}  # socket_id -> session_id

class GameState:
    def __init__(self):
        self.board = [['', '', ''], ['', '', ''], ['', '', '']]
        self.current_player = 'X'
        self.game_over = False
        self.winner = None
        self.is_draw = False

    def make_move(self, row: int, col: int, player: str) -> bool:
        if self.board[row][col] == '' and not self.game_over and self.current_player == player:
            self.board[row][col] = player
            self.check_game_over()
            if not self.game_over:
                self.current_player = 'O' if player == 'X' else 'X'
            return True
        return False

    def check_game_over(self):
        # Check rows, columns, and diagonals
        for i in range(3):
            # Check rows
            if self.board[i][0] == self.board[i][1] == self.board[i][2] != '':
                self.winner = self.board[i][0]
                self.game_over = True
                return
            # Check columns
            if self.board[0][i] == self.board[1][i] == self.board[2][i] != '':
                self.winner = self.board[0][i]
                self.game_over = True
                return

        # Check diagonals
        if self.board[0][0] == self.board[1][1] == self.board[2][2] != '':
            self.winner = self.board[0][0]
            self.game_over = True
            return
        if self.board[0][2] == self.board[1][1] == self.board[2][0] != '':
            self.winner = self.board[0][2]
            self.game_over = True
            return

        # Check for draw
        if all(cell != '' for row in self.board for cell in row):
            self.is_draw = True
            self.game_over = True

    def to_dict(self):
        return {
            'board': self.board,
            'current_player': self.current_player,
            'game_over': self.game_over,
            'winner': self.winner,
            'is_draw': self.is_draw
        }

def create_session(creator_name: str, password: Optional[str] = None) -> str:
    session_id = str(uuid.uuid4())[:8]
    game_sessions[session_id] = {
        'id': session_id,
        'creator': creator_name,
        'password': password,
        'players': [{'name': creator_name, 'symbol': 'X', 'socket_id': request.sid}],
        'game_state': GameState(),
        'chat_messages': [],
        'created_at': datetime.now().isoformat(),
        'status': 'waiting'  # waiting, playing, finished
    }
    return session_id

def get_active_sessions() -> List[dict]:
    return [
        {
            'id': session['id'],
            'creator': session['creator'],
            'has_password': session['password'] is not None,
            'player_count': len(session['players']),
            'status': session['status'],
            'created_at': session['created_at']
        }
        for session in game_sessions.values()
        if session['status'] in ['waiting', 'playing']
    ]

def broadcast_session_list_update():
    """Broadcast updated session list to all connected clients"""
    sessions = get_active_sessions()
    print(f"Broadcasting session list update: {len(sessions)} active sessions")
    socketio.emit('sessions_list', {'sessions': sessions})

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('connected', {'status': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    # Remove player from their session
    if request.sid in player_sessions:
        session_id = player_sessions[request.sid]
        if session_id in game_sessions:
            session = game_sessions[session_id]
            leaving_player = next((p for p in session['players'] if p['socket_id'] == request.sid), None)
            session['players'] = [p for p in session['players'] if p['socket_id'] != request.sid]
            
            # If no players left, remove session
            if not session['players']:
                print(f"Session {session_id} removed - no players remaining")
                del game_sessions[session_id]
                # Broadcast session list update to all connected clients
                broadcast_session_list_update()
            else:
                # Reset game state and status to waiting for new player
                print(f"Player left session {session_id}, resetting to waiting state")
                
                # Reassign the remaining player as 'X' (first player)
                if session['players']:
                    session['players'][0]['symbol'] = 'X'
                    # Update the creator to be the remaining player (now X)
                    session['creator'] = session['players'][0]['name']
                    print(f"Reassigned {session['players'][0]['name']} as player X and new creator")
                
                session['game_state'] = GameState()
                session['status'] = 'waiting'
                
                # Serialize session data for transmission
                session_data = {
                    'id': session['id'],
                    'creator': session['creator'],
                    'password': session['password'],
                    'players': session['players'],
                    'game_state': session['game_state'].to_dict(),
                    'chat_messages': session['chat_messages'],
                    'created_at': session['created_at'],
                    'status': session['status']
                }
                
                # Notify remaining players
                player_name = leaving_player['name'] if leaving_player else 'A player'
                emit('player_left', {
                    'message': f'{player_name} has left the game. Waiting for a new player...',
                    'session': session_data
                }, room=session_id)
                
                # Broadcast session list update to all connected clients
                broadcast_session_list_update()
        
        del player_sessions[request.sid]

@socketio.on('create_session')
def handle_create_session(data):
    creator_name = data.get('player_name')
    password = data.get('password')
    
    if not creator_name:
        emit('error', {'message': 'Player name is required'})
        return
    
    session_id = create_session(creator_name, password)
    player_sessions[request.sid] = session_id
    join_room(session_id)
    
    session = game_sessions[session_id]
    session_data = {
        'id': session['id'],
        'creator': session['creator'],
        'password': session['password'],
        'players': session['players'],
        'game_state': session['game_state'].to_dict(),
        'chat_messages': session['chat_messages'],
        'created_at': session['created_at'],
        'status': session['status']
    }
    
    emit('session_created', {
        'session_id': session_id,
        'session': session_data
    })
    
    # Broadcast session list update to all connected clients
    broadcast_session_list_update()

@socketio.on('join_session')
def handle_join_session(data):
    print(f"JOIN_SESSION received: {data} from socket {request.sid}")
    
    session_id = data.get('session_id')
    player_name = data.get('player_name')
    password = data.get('password')
    
    if not session_id or not player_name:
        print(f"Missing data - session_id: {session_id}, player_name: {player_name}")
        emit('error', {'message': 'Session ID and player name are required'})
        return
    
    if session_id not in game_sessions:
        print(f"Session {session_id} not found in {list(game_sessions.keys())}")
        emit('error', {'message': 'Session not found'})
        return
    
    session = game_sessions[session_id]
    print(f"Found session: {session_id}, current players: {[p['name'] for p in session['players']]}")
    
    # Check if player is trying to join their own session
    for player in session['players']:
        if player['name'].lower() == player_name.lower():
            print(f"Player {player_name} trying to join their own session")
            emit('error', {'message': 'You cannot join your own session'})
            return
        if player['socket_id'] == request.sid:
            print(f"Socket {request.sid} already in this session")
            emit('error', {'message': 'You are already in this session'})
            return
    
    # Check password
    if session['password'] and session['password'] != password:
        print(f"Password mismatch for session {session_id}")
        emit('error', {'message': 'Incorrect password'})
        return
    
    # Check if session is full
    if len(session['players']) >= 2:
        print(f"Session {session_id} is full")
        emit('error', {'message': 'Session is full'})
        return
    
    # Check if session is already finished
    if session['status'] == 'finished':
        print(f"Session {session_id} is finished")
        emit('error', {'message': 'Game has already finished'})
        return
    
    print(f"Adding player {player_name} to session {session_id}")
    
    # Determine the symbol for the new player
    existing_symbols = [p['symbol'] for p in session['players']]
    new_symbol = 'X' if 'X' not in existing_symbols else 'O'
    
    print(f"Assigning symbol {new_symbol} to {player_name}")
    
    # Add player to session
    session['players'].append({
        'name': player_name,
        'symbol': new_symbol,
        'socket_id': request.sid
    })
    
    player_sessions[request.sid] = session_id
    join_room(session_id)
    
    # Start game if we now have 2 players
    if len(session['players']) == 2:
        session['status'] = 'playing'
        print(f"Session {session_id} now has 2 players, starting game")
        print(f"Players: {[(p['name'], p['symbol']) for p in session['players']]}")
        print(f"Current turn: {session['game_state'].current_player}")
    
    # Serialize session data for transmission
    session_data = {
        'id': session['id'],
        'creator': session['creator'],
        'password': session['password'],
        'players': session['players'],
        'game_state': session['game_state'].to_dict(),
        'chat_messages': session['chat_messages'],
        'created_at': session['created_at'],
        'status': session['status']
    }
    
    print(f"Emitting events for session {session_id}")
    
    # Notify all players in the session
    print(f"Emitting player_joined to room {session_id}")
    emit('player_joined', {
        'session': session_data,
        'new_player': player_name
    }, room=session_id)
    
    print(f"Emitting session_joined to socket {request.sid}")
    emit('session_joined', {
        'session_id': session_id,
        'session': session_data
    })
    
    print(f"JOIN_SESSION completed successfully for {player_name} in session {session_id}")
    
    # Broadcast session list update to all connected clients
    broadcast_session_list_update()

@socketio.on('make_move')
def handle_make_move(data):
    if request.sid not in player_sessions:
        emit('error', {'message': 'Not in a game session'})
        return
    
    session_id = player_sessions[request.sid]
    if session_id not in game_sessions:
        emit('error', {'message': 'Session not found'})
        return
    
    session = game_sessions[session_id]
    row = data.get('row')
    col = data.get('col')
    
    # Find the player making the move
    player = next((p for p in session['players'] if p['socket_id'] == request.sid), None)
    if not player:
        emit('error', {'message': 'Player not found in session'})
        return
    
    # Make the move
    game_state = session['game_state']
    if game_state.make_move(row, col, player['symbol']):
        # Update session
        session['game_state'] = game_state
        
        # Check if game is over
        if game_state.game_over:
            session['status'] = 'finished'
        
        # Serialize session data for transmission
        session_data = {
            'id': session['id'],
            'creator': session['creator'],
            'password': session['password'],
            'players': session['players'],
            'game_state': session['game_state'].to_dict(),
            'chat_messages': session['chat_messages'],
            'created_at': session['created_at'],
            'status': session['status']
        }
        
        # Broadcast the move to all players in the session
        emit('move_made', {
            'session': session_data,
            'move': {
                'row': row,
                'col': col,
                'player': player['name'],
                'symbol': player['symbol']
            },
            'game_state': game_state.to_dict()
        }, room=session_id)
        
        if game_state.game_over:
            result = 'draw' if game_state.is_draw else f"{player['name']} wins!"
            emit('game_over', {
                'result': result,
                'winner': game_state.winner,
                'is_draw': game_state.is_draw
            }, room=session_id)
    else:
        emit('error', {'message': 'Invalid move'})

@socketio.on('get_sessions')
def handle_get_sessions():
    emit('sessions_list', {'sessions': get_active_sessions()})

@socketio.on('send_chat_message')
def handle_send_chat_message(data):
    if request.sid not in player_sessions:
        emit('error', {'message': 'Not in a game session'})
        return
    
    session_id = player_sessions[request.sid]
    if session_id not in game_sessions:
        emit('error', {'message': 'Session not found'})
        return
    
    session = game_sessions[session_id]
    message_text = data.get('message', '').strip()
    
    if not message_text:
        return
    
    # Find the player sending the message
    player = next((p for p in session['players'] if p['socket_id'] == request.sid), None)
    if not player:
        emit('error', {'message': 'Player not found in session'})
        return
    
    # Create chat message
    chat_message = {
        'id': str(uuid.uuid4())[:8],
        'player_name': player['name'],
        'message': message_text,
        'timestamp': datetime.now().isoformat(),
        'player_symbol': player['symbol']
    }
    
    # Add to session chat history
    session['chat_messages'].append(chat_message)
    
    # Keep only last 50 messages
    if len(session['chat_messages']) > 50:
        session['chat_messages'] = session['chat_messages'][-50:]
    
    print(f"Chat message from {player['name']} in session {session_id}: {message_text}")
    
    # Broadcast to all players in the session
    emit('chat_message_received', {
        'message': chat_message
    }, room=session_id)

@socketio.on('restart_game')
def handle_restart_game():
    if request.sid not in player_sessions:
        emit('error', {'message': 'Not in a game session'})
        return
    
    session_id = player_sessions[request.sid]
    if session_id not in game_sessions:
        emit('error', {'message': 'Session not found'})
        return
    
    session = game_sessions[session_id]
    
    # Reset game state
    session['game_state'] = GameState()
    session['status'] = 'playing'
    
    # Serialize session data for transmission
    session_data = {
        'id': session['id'],
        'creator': session['creator'],
        'password': session['password'],
        'players': session['players'],
        'game_state': session['game_state'].to_dict(),
        'chat_messages': session['chat_messages'],
        'created_at': session['created_at'],
        'status': session['status']
    }
    
    # Notify all players
    emit('game_restarted', {
        'session': session_data,
        'game_state': session['game_state'].to_dict()
    }, room=session_id)
    
    # Broadcast session list update to all connected clients
    broadcast_session_list_update()

@app.route('/health')
def health_check():
    """Health check endpoint for Docker"""
    return {'status': 'healthy', 'active_sessions': len(game_sessions)}, 200

if __name__ == '__main__':
    # Production vs Development settings
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    socketio.run(app, debug=debug_mode, host='0.0.0.0', port=5000) 