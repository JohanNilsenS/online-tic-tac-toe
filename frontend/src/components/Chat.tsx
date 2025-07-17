import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import './Chat.css';

interface ChatProps {
  messages: ChatMessage[];
  currentPlayerName: string;
  onSendMessage: (message: string) => void;
  isGameActive: boolean;
}

const Chat: React.FC<ChatProps> = ({
  messages,
  currentPlayerName,
  onSendMessage,
  isGameActive,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage && isGameActive) {
      onSendMessage(trimmedMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className={`chat-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="chat-header" onClick={toggleChat}>
        <span className="chat-title">
          💬 Chat {messages.length > 0 && `(${messages.length})`}
        </span>
        <span className="chat-toggle">
          {isExpanded ? '−' : '+'}
        </span>
      </div>

      {isExpanded && (
        <div className="chat-body">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet...</p>
                <p>Say hello to your opponent! 👋</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${
                    message.player_name === currentPlayerName ? 'own-message' : 'other-message'
                  }`}
                >
                  <div className="message-header">
                    <span className={`player-name ${message.player_symbol.toLowerCase()}`}>
                      {message.player_name} ({message.player_symbol})
                    </span>
                    <span className="message-time">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.message}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isGameActive ? "Type a message..." : "Join a game to chat"}
              className="chat-input"
              maxLength={200}
              disabled={!isGameActive}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isGameActive}
              className="send-button"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat; 