// Chatbot functionality
let chatHistory = [];

// Load chat history on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadChatHistory();
    
    // Auto-resize textarea
    const chatInput = document.getElementById('chat-input');
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
});

// Handle form submission
document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Hide empty state
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Add user message to chat
    addMessage('user', message);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Disable input
    const sendBtn = document.getElementById('send-btn');
    sendBtn.disabled = true;
    
    try {
        const response = await fetch('/chatbot/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Add AI response to chat
            addMessage('assistant', data.response);
        } else {
            addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        }
    } catch (error) {
        addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        console.error('Error:', error);
    } finally {
        // Hide typing indicator
        hideTypingIndicator();
        
        // Re-enable input
        sendBtn.disabled = false;
        input.focus();
    }
});

// Add message to chat
function addMessage(role, content) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'You' : 'AI';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Format message content (support basic markdown)
    const formattedContent = formatMessage(content);
    messageContent.innerHTML = formattedContent;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    messageContent.appendChild(messageTime);
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add to history
    chatHistory.push({ role, message: content });
}

// Format message content (basic markdown support)
function formatMessage(text) {
    // Convert markdown-style formatting
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    
    // Convert numbered lists
    text = text.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    if (text.includes('<li>')) {
        text = '<ol>' + text + '</ol>';
    }
    
    // Convert bullet points
    text = text.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
    if (text.includes('<li>') && !text.includes('<ol>')) {
        text = '<ul>' + text + '</ul>';
    }
    
    return text;
}

// Show typing indicator
function showTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.classList.add('active');
    
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.classList.remove('active');
}

// Load chat history
async function loadChatHistory() {
    try {
        const response = await fetch('/chatbot/history?limit=50');
        const data = await response.json();
        
        if (data.history && data.history.length > 0) {
            // Hide empty state
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Display messages
            data.history.forEach(msg => {
                addMessage(msg.role, msg.message);
            });
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Handle suggestion button clicks
function sendSuggestion(text) {
    const input = document.getElementById('chat-input');
    input.value = text;
    input.dispatchEvent(new Event('input'));
    
    // Submit form
    document.getElementById('chat-form').dispatchEvent(new Event('submit'));
}

// Handle Enter key (but allow Shift+Enter for new line)
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        document.getElementById('chat-form').dispatchEvent(new Event('submit'));
    }
}

