# 🎮 Online Tic-Tac-Toe Game

A real-time multiplayer tic-tac-toe game built with React (TypeScript) frontend and Flask backend.

## 🌟 **Live Demo**

**🎯 Play Now**: [https://tictac.johancv.com](https://tictac.johancv.com)

## ✨ Features

- 🎮 **Real-time multiplayer gameplay** with WebSockets
- 🏠 **Browse and join active game sessions**
- 🔐 **Optional password protection** for sessions
- 👤 **Simple name-based authentication** (no registration required)
- 🆔 **Join sessions by ID** or browse from list
- 💬 **In-game chat system** for player communication
- 🔄 **Smart disconnect handling** - sessions persist when players leave
- 📱 **Responsive design** for mobile and desktop
- 🚀 **Production-ready deployment** with Docker

## 🏗️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for development and building
- Socket.IO Client for real-time communication
- Modern CSS with glassmorphism design

**Backend:**
- Flask with Python 3.11
- Flask-SocketIO for WebSocket communication
- In-memory session management
- RESTful health endpoints

**Infrastructure:**
- Docker & Docker Compose for containerization
- Nginx for serving frontend and proxying WebSocket connections
- Production-ready with health checks and monitoring

## 🚀 Quick Start

### **🎮 Play Online (Recommended)**
Visit **[tictac.johancv.com](https://tictac.johancv.com)** to play immediately!

### **💻 Local Development**

#### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

#### Backend Setup
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

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

**Access the game**: `http://localhost:5173`

## 🎯 How to Play

1. **Enter your name** on the landing page
2. **Choose your game mode:**
   - **Create Session**: Start a new game (optionally with password)
   - **Join by ID**: Enter a session ID to join a specific game
   - **Browse Sessions**: See all active games and join one

3. **Share the session ID** with a friend to play together
4. **Use the chat** to communicate during the game
5. **Take turns** clicking on the tic-tac-toe board
6. **Win by getting 3 in a row** (horizontal, vertical, or diagonal)

## 🎮 Game Features

### **Session Management**
- **Create password-protected games** for private matches
- **Browse active sessions** to find opponents
- **Smart disconnect handling** - games don't break when players leave
- **Real-time session updates** across all browsers

### **Gameplay**
- **Classic tic-tac-toe rules** with modern UI
- **Real-time moves** with instant synchronization
- **Turn indicators** and visual feedback
- **Win/draw detection** with celebration animations
- **Game restart** functionality

### **Communication**
- **Collapsible chat window** for in-game messaging
- **Real-time message delivery** between players
- **Player identification** with symbols (X/O)
- **Message history** with timestamps
- **Mobile-friendly chat** interface

## 🐳 Production Deployment

### **Environment Variables**
```bash
# Required for production
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here

# Optional overrides
ALLOWED_ORIGINS=https://tictac.johancv.com
```

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose build
docker-compose up -d

# Check service health
docker-compose ps
docker-compose logs -f
```

### **Dokploy Deployment**
1. **Create new project** in Dokploy dashboard
2. **Connect GitHub repository**
3. **Set environment variables**
4. **Configure domain**: `tictac.johancv.com`
5. **Deploy with Docker Compose**

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed deployment instructions.

## 🔧 Development

### **Project Structure**
```
online-tic-tac-toe/
├── frontend/              # React TypeScript app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # Socket.IO service
│   │   ├── types/         # TypeScript interfaces
│   │   └── App.tsx        # Main application
│   ├── Dockerfile         # Frontend container
│   └── nginx.conf         # Production web server config
├── backend/               # Flask Python app
│   ├── app.py            # Main Flask application
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile        # Backend container
├── docker-compose.yml     # Production orchestration
└── README.md             # This file
```

### **Key Components**
- **LandingPage**: Session creation and browsing
- **GameBoard**: Tic-tac-toe gameplay interface  
- **Chat**: Real-time messaging component
- **SocketService**: WebSocket communication layer

### **Architecture**
```
React Frontend ↔ Socket.IO ↔ Flask Backend
     ↓              ↓            ↓
   Nginx      WebSocket     Session Store
```

## 🧪 Testing

### **Manual Testing**
1. **Open multiple browser windows**
2. **Create session in one window**
3. **Join from another window**
4. **Test all features:**
   - Game moves and turn management
   - Chat messaging
   - Player disconnect/reconnect
   - Session browsing and joining

### **Health Checks**
```bash
# Backend health
curl http://localhost:5000/health

# Frontend health (production)
curl http://localhost/health
```

## 🎨 Design Features

- **Glassmorphism UI** with backdrop blur effects
- **Smooth animations** for moves and interactions
- **Responsive layout** for all screen sizes
- **Modern color scheme** with gradients
- **Accessible design** with clear visual feedback

## 🔐 Security Features

- **CORS protection** with domain restrictions
- **Non-root Docker containers** for security
- **Security headers** in Nginx configuration
- **Environment-based configuration** for secrets
- **Input validation** and sanitization

## 🚨 Troubleshooting

### **Common Issues**

**Connection Problems:**
- Check that backend is running on port 5000
- Verify Socket.IO connection in browser console
- Ensure CORS settings allow your domain

**Deployment Issues:**
- Check Docker container logs: `docker-compose logs`
- Verify environment variables are set
- Test health endpoints

**Game State Issues:**
- Refresh the page to reset client state
- Check browser console for JavaScript errors
- Verify player names don't conflict

See **[DEBUGGING.md](DEBUGGING.md)** for detailed troubleshooting.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature-name`
3. **Make your changes** and test thoroughly
4. **Commit**: `git commit -m "Add feature"`
5. **Push**: `git push origin feature-name`
6. **Open a Pull Request**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Future Enhancements

- **User accounts** with persistent statistics
- **Tournament mode** with brackets
- **AI opponent** with difficulty levels
- **Game replay** system
- **Multiple board sizes** (4x4, 5x5)
- **Spectator mode** for watching games
- **Voice chat** integration
- **Mobile app** versions

## 🎉 Credits

Built with ❤️ using modern web technologies:
- **React** for the frontend framework
- **Flask** for the backend API
- **Socket.IO** for real-time communication  
- **Docker** for containerization
- **Nginx** for production web serving

---

**🎮 Start playing now at [tictac.johancv.com](https://tictac.johancv.com)!** 