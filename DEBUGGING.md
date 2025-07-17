# 🐛 Debugging the Browse Sessions Issue

## Steps to Test & Debug

### 1. **Setup for Testing**
```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\Activate.ps1  # Windows
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. **Testing Scenario**
1. **Open two browser windows/tabs** to `http://localhost:5173`
2. **Window 1**: 
   - Enter name "Player1"
   - Create Session (note the session ID)
   - Should see waiting modal
3. **Window 2**:
   - Enter name "Player2" 
   - Go to "Browse Sessions" tab
   - Try to join Player1's session

### 3. **What to Look For**

#### **Console Logs (F12 → Console)**
Look for these debug messages in **Window 2**:

```
✅ Expected Flow:
1. "Attempting to join session: [SESSION_ID] with name: Player2 password: no"
2. "Socket emitting join_session: {session_id: '...', player_name: 'Player2', password: undefined}"
3. "Received session_joined event: {session_id: '...', session: {...}}"
4. "App handling session_joined: {session_id: '...', session: {...}}"

❌ If you see errors:
- "Socket not connected when trying to join session"
- "Received error event: {message: '...'}"
- "App handling error: {message: '...'}"
```

#### **Expected Behavior**
- **Window 2** should navigate to game board immediately
- **Window 1** waiting modal should disappear
- Both windows should show the game board with player names

#### **Common Issues to Check**

1. **Backend Running**: Make sure Flask server is running on port 5000
2. **Socket Connection**: Check if "Connected to server" appears in console
3. **Name Conflicts**: Make sure both players have different names
4. **Password Issues**: If session has password, the modal should appear first

### 4. **Backend Debug**
Check backend terminal for:
```
Client connected: [SOCKET_ID]
Client disconnected: [SOCKET_ID]
```

### 5. **Quick Fixes to Try**

If Browse Sessions doesn't work:
1. **Refresh both browser windows**
2. **Try "Join by ID" tab instead** (enter session ID manually)
3. **Clear browser cache** and try again
4. **Check if session appears in the list** (refresh sessions button)

### 6. **Report Back**
When testing, please share:
- Which step fails
- Console error messages
- Whether "Join by ID" works instead
- Backend terminal output

This will help pinpoint exactly where the issue occurs! 