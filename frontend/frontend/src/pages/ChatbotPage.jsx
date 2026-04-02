import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { formatMessage } from '../utils/markdownLite';

export default function ChatbotPage() {
  const location = useLocation();
  const activeLink = (path) => (location.pathname === path ? 'active' : '');

  const suggestions = useMemo(
    () => [
      'Give me content ideas for Instagram',
      'Help me write a better caption',
      'Create ad copy for my product',
      'Marketing strategy advice',
    ],
    [],
  );

  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  const messagesRef = useRef(null);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiFetch('/chatbot/history?limit=50');
        if (!mounted) return;
        setMessages(data?.history || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load chat history');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const addMessage = (role, message, timestamp) => {
    setMessages((prev) => [...prev, { role, message, timestamp }]);
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);
    setInput('');
    addMessage('user', trimmed, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    setTyping(true);
    try {
      const data = await apiFetch('/chatbot/message', {
        method: 'POST',
        body: { message: trimmed },
      });
      addMessage(
        'assistant',
        data?.response || 'Sorry, I encountered an error. Please try again.',
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      );
    } catch (e) {
      setError(e?.message || 'Sorry, I encountered an error. Please try again.');
      addMessage(
        'assistant',
        'Sorry, I encountered an error. Please try again.',
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      );
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  };

  const sendSuggestion = (text) => {
    setInput(text);
    sendMessage(text);
  };

  return (
    <div>
      <div className="sidebar">
        <div className="sidebar-logo">MarketAI</div>
        <ul className="sidebar-nav">
          <li>
            <Link to="/dashboard" className={activeLink('/dashboard')}>Dashboard</Link>
          </li>
          <li>
            <Link to="/generator" className={activeLink('/generator')}>AI Generator</Link>
          </li>
          <li>
            <Link to="/chatbot" className={activeLink('/chatbot')}>Chatbot</Link>
          </li>
          <li>
            <Link to="/social" className={activeLink('/social')}>Social Accounts</Link>
          </li>
          <li>
            <a href="/api/logout" onClick={async (ev) => { ev.preventDefault(); await apiFetch('/api/logout', { method: 'POST' }); window.location.href = '/login'; }}>
              Logout
            </a>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <header>
          <h1>Marketing Chatbot</h1>
          <p className="subtitle">Get AI-powered marketing advice, content ideas, and strategy suggestions</p>
        </header>

        <div className="card" style={{ padding: 0 }}>
          <div className="chat-container">
            <div className="chat-messages" ref={messagesRef}>
              {messages.length === 0 ? (
                <div className="empty-state">
                  <h3>👋 Welcome to your Marketing Assistant!</h3>
                  <p>Ask me anything about:</p>
                  <div className="suggestions">
                    {suggestions.map((s) => (
                      <button key={s} className="suggestion-btn" type="button" onClick={() => sendSuggestion(s)}>
                        {s.includes('Instagram') ? 'Content Ideas' : s.includes('caption') ? 'Caption Rewrite' : s.includes('ad copy') ? 'Ad Copy' : 'Strategy Advice'}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((msg, idx) => {
                const role = msg.role;
                const isUser = role === 'user';
                return (
                  <div key={idx} className={`message ${role}`}>
                    <div className="message-avatar">{isUser ? 'You' : 'AI'}</div>
                    <div className="message-content">
                      <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.message) }} />
                      <div className="message-time">{(msg.timestamp || '').toString()}</div>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            <div className={`typing-indicator ${typing ? 'active' : ''}`}>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>

            <div className="chat-input-container">
              <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}>
                <textarea
                  className="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about marketing, content, campaigns..."
                  rows="1"
                  onKeyDown={handleKeyDown}
                />
                <button type="submit" className="chat-send-btn" disabled={typing}>
                  {typing ? 'Thinking...' : 'Send'}
                </button>
              </form>
              {error ? <div style={{ marginTop: 10, color: 'var(--text-secondary)' }}>{error}</div> : null}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .chat-container {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 200px);
            max-height: 800px;
            background: var(--bg-card);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            overflow: hidden;
          }
          .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .message {
            display: flex;
            gap: 12px;
            max-width: 80%;
            animation: fadeIn 0.3s ease;
          }
          .message.user { align-self: flex-end; flex-direction: row-reverse; }
          .message.assistant { align-self: flex-start; }
          .message-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            flex-shrink: 0;
          }
          .message.user .message-avatar {
            background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
            color: white;
          }
          .message.assistant .message-avatar {
            background: var(--bg-secondary);
            color: var(--accent-purple);
            border: 2px solid var(--accent-purple);
          }
          .message-content {
            background: var(--bg-secondary);
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            line-height: 1.6;
          }
          .message.user .message-content {
            background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
            color: white;
            border: none;
          }
          .message-time {
            font-size: 0.75em;
            color: var(--text-secondary);
            margin-top: 4px;
          }
          .chat-input-container {
            padding: 20px;
            border-top: 1px solid var(--border-color);
            background: var(--bg-card);
          }
          .chat-input-form { display: flex; gap: 10px; }
          .chat-input {
            flex: 1;
            padding: 12px 16px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            color: var(--text-primary);
            font-family: inherit;
            font-size: 1em;
            resize: none;
            max-height: 120px;
          }
          .chat-input:focus {
            outline: none;
            border-color: var(--accent-purple);
            box-shadow: 0 0 0 3px var(--shadow-glow);
          }
          .chat-send-btn {
            padding: 12px 24px;
            background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px var(--shadow-glow);
          }
          .chat-send-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px var(--shadow-glow);
          }
          .chat-send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
          .typing-indicator {
            display: none;
            padding: 12px 16px;
            background: var(--bg-secondary);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            max-width: 80px;
          }
          .typing-indicator.active { display: flex; gap: 4px; }
          .typing-dot {
            width: 8px;
            height: 8px;
            background: var(--text-secondary);
            border-radius: 50%;
            animation: typing 1.4s infinite;
          }
          .typing-dot:nth-child(2) { animation-delay: 0.2s; }
          .typing-dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
            30% { transform: translateY(-10px); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-secondary);
          }
          .empty-state h3 { color: var(--text-primary); margin-bottom: 10px; }
          .suggestions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
          .suggestion-btn {
            padding: 8px 16px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            color: var(--text-primary);
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s ease;
          }
          .suggestion-btn:hover {
            background: var(--bg-hover);
            border-color: var(--accent-purple);
          }
        `}
      </style>
    </div>
  );
}

