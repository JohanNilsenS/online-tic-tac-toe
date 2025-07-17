# 🚀 Deployment Guide - Online Tic-Tac-Toe

This guide covers deploying the Online Tic-Tac-Toe game to production using Docker Compose on Dokploy.

## 📋 **Prerequisites**

- **Domain**: tictac.johancv.com configured in DNS
- **Dokploy instance** running with Docker support
- **Git repository** on GitHub
- **SSL certificate** (handled by Dokploy/Traefik)

## 🏗️ **Architecture**

```
Internet → Traefik (SSL/Reverse Proxy) → Nginx (Frontend) → Flask (Backend)
                                      ↓
                                   Socket.IO (WebSocket)
```

### **Services:**
- **Frontend**: React app served by Nginx on port 80
- **Backend**: Flask + Socket.IO on port 5000 (internal)
- **Network**: Bridge network for service communication

## 📁 **Project Structure**

```
online-tic-tac-toe/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies  
│   └── Dockerfile         # Backend container
├── frontend/
│   ├── src/               # React source code
│   ├── nginx.conf         # Nginx configuration
│   └── Dockerfile         # Frontend container
├── docker-compose.yml     # Production orchestration
└── DEPLOYMENT.md         # This file
```

## 🐳 **Docker Configuration**

### **Backend (Flask + Socket.IO)**
- **Base Image**: python:3.11-slim
- **Port**: 5000 (internal only)
- **Health Check**: HTTP GET to /health endpoint
- **Security**: Non-root user, minimal dependencies

### **Frontend (React + Nginx)**
- **Build Stage**: Node.js 18 Alpine for building React app
- **Production Stage**: Nginx Alpine for serving static files
- **Port**: 80 (exposed to Traefik)
- **Features**: Gzip compression, SPA routing, Socket.IO proxy

## 🌐 **Network Configuration**

### **Nginx Proxy Configuration**
```nginx
# Socket.IO connections → Backend
location /socket.io/ {
    proxy_pass http://backend:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# Static files → React SPA
location / {
    try_files $uri $uri/ /index.html;
}
```

### **CORS Settings**
- **Development**: Allow all origins (`*`)
- **Production**: Restrict to `tictac.johancv.com` and `johancv.com`

## 📤 **GitHub Setup**

### **1. Repository Structure**
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: Online Tic-Tac-Toe Game"

# Add remote and push
git remote add origin https://github.com/yourusername/online-tic-tac-toe.git
git branch -M main
git push -u origin main
```

### **2. .gitignore**
Already configured to exclude:
- `node_modules/`
- Python virtual environments
- Build artifacts
- Environment files

## 🚢 **Dokploy Deployment**

### **1. Create New Project**
1. **Login to Dokploy dashboard**
2. **Create new project**: "online-tic-tac-toe"
3. **Select Docker Compose** deployment type

### **2. Repository Configuration**
```yaml
Repository: https://github.com/yourusername/online-tic-tac-toe.git
Branch: main
Build Context: ./
Compose File: docker-compose.yml
```

### **3. Environment Variables**
```bash
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here-change-this
```

### **4. Domain Configuration**
```yaml
Domain: tictac.johancv.com
SSL: Auto (Let's Encrypt)
Port: 80
Protocol: HTTP
```

### **5. Deploy Commands**
```bash
# Dokploy will automatically run:
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 **Local Testing (Optional)**

### **Test Docker Build Locally**
```bash
# Build and run locally
docker-compose build
docker-compose up -d

# Check services
docker-compose ps
docker-compose logs frontend
docker-compose logs backend

# Test application
curl http://localhost/health
```

### **Environment Setup**
```bash
# Backend testing
cd backend
python -m venv venv
venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
python app.py

# Frontend testing  
cd frontend
npm install
npm run dev
```

## 🔍 **Health Checks**

### **Backend Health**
- **Endpoint**: `GET /health`
- **Response**: `{"status": "healthy", "active_sessions": 0}`
- **Docker**: Automatic health monitoring

### **Frontend Health**
- **Endpoint**: `GET /health`
- **Response**: `healthy`
- **Docker**: Wget-based health check

## 🚨 **Troubleshooting**

### **Common Issues**

**1. Socket.IO Connection Failed**
```bash
# Check nginx logs
docker-compose logs frontend

# Verify backend is running
docker-compose logs backend

# Test internal connectivity
docker-compose exec frontend curl http://backend:5000/health
```

**2. Build Failures**
```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose build --no-cache

# Check specific service
docker-compose build backend
docker-compose build frontend
```

**3. CORS Errors**
- Verify domain in `backend/app.py` CORS settings
- Check that `FLASK_ENV=production` is set
- Ensure SSL is working (`https://` not `http://`)

### **Logs & Monitoring**
```bash
# View all logs
docker-compose logs -f

# Service-specific logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Container status
docker-compose ps
```

## 🎯 **Production Checklist**

### **Security**
- ✅ **Non-root Docker users**
- ✅ **CORS restricted to specific domains**
- ✅ **Security headers in Nginx**
- ✅ **SSL/HTTPS enforced**
- ✅ **Secret key set via environment variable**

### **Performance**
- ✅ **Gzip compression enabled**
- ✅ **Static asset caching (1 year)**
- ✅ **Multi-stage Docker builds**
- ✅ **Health checks configured**
- ✅ **Production React build**

### **Reliability**
- ✅ **Automatic container restart**
- ✅ **Health monitoring**
- ✅ **Graceful service dependencies**
- ✅ **Error logging**

## 🎮 **Post-Deployment Testing**

### **Functional Tests**
1. **Visit**: `https://tictac.johancv.com`
2. **Create session** with a name
3. **Open second browser/incognito**: Join session
4. **Play game**: Test full gameplay
5. **Test chat**: Send messages between players
6. **Test disconnect**: Close one browser, rejoin with another
7. **Mobile test**: Verify responsive design

### **Performance Tests**
```bash
# Health checks
curl https://tictac.johancv.com/health

# Load testing (optional)
curl -w "@curl-format.txt" -s -o /dev/null https://tictac.johancv.com
```

## 🎉 **Success!**

Your Online Tic-Tac-Toe game should now be live at:
**https://tictac.johancv.com** 🎮

### **Features Available**
- ✅ **Real-time multiplayer gameplay**
- ✅ **Session browsing and joining**  
- ✅ **In-game chat system**
- ✅ **Player disconnect handling**
- ✅ **Mobile-responsive design**
- ✅ **Production-grade infrastructure**

Enjoy your deployed game! 🚀✨ 