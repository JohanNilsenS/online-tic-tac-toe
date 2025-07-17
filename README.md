# Online Tic-Tac-Toe Game

A real-time multiplayer tic-tac-toe game built with React (TypeScript) frontend and Flask backend.

## Features

- 🎮 Real-time multiplayer gameplay
- 🏠 Browse and join active game sessions
- 🔐 Optional password protection for sessions
- 👤 Simple name-based authentication (no registration required)
- 🆔 Join sessions by ID
- 📱 Responsive design

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Socket.IO Client

**Backend:**
- Flask
- Flask-SocketIO
- Python 3.x

## Setup Instructions

### Frontend Setup
```bash
cd frontend
npx create-vite . --template react-ts
npm install
npm install socket.io-client
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate

pip install flask flask-socketio python-socketio eventlet
python app.py
```

## How to Play

1. Enter your name on the landing page
2. Either:
   - Create a new session (optionally with password)
   - Join an existing session by ID
   - Browse and join from the active sessions list
3. Wait for another player to join
4. Take turns placing X's and O's
5. First to get 3 in a row wins!

## Game Rules

- Standard tic-tac-toe rules
- X always goes first
- Players alternate turns
- Win by getting 3 in a row (horizontal, vertical, or diagonal)
- Game ends in draw if board is full with no winner

## Development

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

Real-time communication is handled via WebSockets using Socket.IO. 