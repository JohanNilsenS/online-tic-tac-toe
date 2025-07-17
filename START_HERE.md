# 🎮 Online Tic-Tac-Toe Game - Getting Started

Welcome to your brand new online multiplayer tic-tac-toe game! This guide will help you get everything up and running.

## 🏗️ Project Structure

```
online-tic-tac-toe/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LandingPage.css
│   │   │   ├── GameBoard.tsx
│   │   │   └── GameBoard.css
│   │   ├── services/
│   │   │   └── socket.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
├── backend/                  # Flask + Socket.IO
│   ├── app.py
│   ├── requirements.txt
│   └── setup.py
├── README.md
└── .gitignore
```

## 🚀 Quick Start

### Option 1: Manual Setup (Recommended for learning)

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

#### 2. Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

### Option 2: Automated Setup

#### 1. Backend Setup
```bash
cd backend
python setup.py
# Follow the instructions displayed
python app.py
```

#### 2. Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

## 🎯 How to Play

1. **Start both servers** (backend on :5000, frontend on :5173)
2. **Open your browser** to `http://localhost:5173`
3. **Enter your name** in the landing page
4. **Choose your game mode:**
   - **Create Session**: Start a new game (optionally with password)
   - **Join by ID**: Enter a session ID to join a specific game
   - **Browse Sessions**: See all active games and join one

5. **Share the session ID** with a friend to play together!
6. **Take turns** clicking on the tic-tac-toe board
7. **Win by getting 3 in a row** (horizontal, vertical, or diagonal)

## ✨ Features

### ✅ Completed Features
- **Real-time multiplayer gameplay** with WebSockets
- **Session-based games** with unique IDs
- **Optional password protection** for private games
- **Browse active sessions** to find games to join
- **Beautiful, responsive UI** with modern design
- **Player disconnect handling**
- **Game restart functionality**
- **Turn-based gameplay** with visual indicators
- **Win/draw detection** and game over states

### 🎮 Game Flow
1. **Landing Page** → Enter name, create/join session
2. **Waiting Room** → Share session ID, wait for opponent
3. **Game Board** → Play tic-tac-toe in real-time
4. **Game Over** → See results, option to play again

## 🛠️ Technical Details

### Frontend (React + TypeScript)
- **Vite** for fast development and building
- **Socket.IO Client** for real-time communication
- **Modern CSS** with glassmorphism design
- **Responsive design** for mobile and desktop
- **TypeScript interfaces** for type safety

### Backend (Python + Flask)
- **Flask-SocketIO** for WebSocket communication
- **Session management** with in-memory storage
- **Game state validation** and turn management
- **Player connection handling**
- **CORS enabled** for local development

## 🔧 Customization Ideas

Want to extend the game? Here are some ideas:

### Easy Additions
- Add sound effects for moves and wins
- Add player avatars or profile pictures
- Implement different board sizes (4x4, 5x5)
- Add game statistics and win counters

### Medium Additions
- User registration and persistent accounts
- Game history and replay system
- Tournament mode with brackets
- Spectator mode for watching games

### Advanced Additions
- AI opponent with different difficulty levels
- Real-time chat during games
- Multiple game rooms/lobbies
- Database persistence for sessions and users

## 🐛 Troubleshooting

### Common Issues

**Frontend won't connect to backend:**
- Make sure the backend is running on port 5000
- Check that no firewall is blocking the connection
- Verify the Socket.IO URL in `frontend/src/services/socket.ts`

**"Module not found" errors:**
- Run `npm install` in the frontend directory
- Make sure all dependencies are installed

**Python/pip issues:**
- Ensure Python 3.7+ is installed
- Try `python3` and `pip3` instead of `python` and `pip`
- Make sure you've activated the virtual environment

**Port already in use:**
- Backend: Change the port in `backend/app.py` (line 252)
- Frontend: Vite will automatically use the next available port

## 📝 Development Notes

### Code Structure
- **Components are modular** and reusable
- **TypeScript interfaces** ensure type safety
- **CSS is component-scoped** for maintainability
- **Socket events** are well-documented in types

### Architecture Decisions
- **In-memory storage** for simplicity (sessions reset on server restart)
- **Client-side state management** using React hooks
- **Real-time validation** on both client and server
- **Optimistic updates** for smooth gameplay

## 🎉 You're Ready!

Your online tic-tac-toe game is now ready to play! Start both servers and enjoy gaming with friends.

Need help? Check the README.md for more detailed documentation.

**Happy Gaming! 🎮** 