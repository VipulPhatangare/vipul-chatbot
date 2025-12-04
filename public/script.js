// Initialize chat application
class ChatBot {
    constructor() {
        this.chatContainer = document.getElementById('chatContainer');
        this.messageInput = document.getElementById('messageInput');
        this.chatForm = document.getElementById('chatForm');
        this.sendBtn = document.getElementById('sendBtn');
        this.charCount = document.getElementById('charCount');
        this.menuBtn = document.getElementById('menuBtn');
        this.dropdownMenu = document.getElementById('dropdownMenu');
        this.clearChatBtn = document.getElementById('clearChat');
        this.statusElement = document.getElementById('status');
        
        this.sessionId = this.generateSessionId();
        this.isTyping = false;
        
        this.init();
    }

    init() {
        // Event listeners
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.messageInput.addEventListener('input', () => this.handleInput());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.menuBtn.addEventListener('click', () => this.toggleMenu());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResize());
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.menuBtn.contains(e.target) && !this.dropdownMenu.contains(e.target)) {
                this.dropdownMenu.classList.remove('active');
            }
        });
        
        // Load chat history
        this.loadChatHistory();
        
        // Check server health
        this.checkServerHealth();
        
        console.log('🤖 ChatBot initialized');
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    handleInput() {
        const length = this.messageInput.value.length;
        this.charCount.textContent = `${length}/2000`;
        this.sendBtn.disabled = length === 0 || this.isTyping;
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!this.sendBtn.disabled) {
                this.chatForm.dispatchEvent(new Event('submit'));
            }
        }
    }

    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.handleInput();

        // Remove welcome message if exists
        const welcomeMsg = this.chatContainer.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        // Add user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });

            const data = await response.json();

            // Remove typing indicator
            this.hideTypingIndicator();

            if (data.success) {
                // Add bot response with typing effect
                await this.addBotMessageWithTyping(data.response);
            } else {
                this.showError(data.error || 'Failed to get response');
            }

        } catch (error) {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.showError('Network error. Please check your connection and try again.');
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';

        const content = document.createElement('div');
        content.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatTime(new Date());

        content.appendChild(bubble);
        content.appendChild(time);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();

        return bubble;
    }

    async addBotMessageWithTyping(text) {
        this.isTyping = true;
        this.sendBtn.disabled = true;

        // Create message structure
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';

        const content = document.createElement('div');
        content.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = '';

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatTime(new Date());

        content.appendChild(bubble);
        content.appendChild(time);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        this.chatContainer.appendChild(messageDiv);

        // Typing animation
        let index = 0;
        const typingSpeed = 30; // milliseconds per character

        return new Promise((resolve) => {
            const typeNextChar = () => {
                if (index < text.length) {
                    bubble.textContent += text[index];
                    index++;
                    this.scrollToBottom();
                    setTimeout(typeNextChar, typingSpeed);
                } else {
                    this.isTyping = false;
                    this.sendBtn.disabled = this.messageInput.value.trim().length === 0;
                    resolve();
                }
            };

            typeNextChar();
        });
    }

    showTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.id = 'typingIndicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';

        const content = document.createElement('div');
        content.className = 'message-content';

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

        content.appendChild(indicator);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();

        this.isTyping = true;
        this.sendBtn.disabled = true;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `⚠️ ${message}`;
        
        this.chatContainer.appendChild(errorDiv);
        this.scrollToBottom();

        // Remove error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }, 100);
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    toggleMenu() {
        this.dropdownMenu.classList.toggle('active');
    }

    clearChat() {
        const messages = this.chatContainer.querySelectorAll('.message, .error-message');
        messages.forEach(msg => msg.remove());

        // Show welcome message
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.innerHTML = `
            <div class="welcome-icon">👋</div>
            <h2>Welcome to My Personal Assistant!</h2>
            <p>Ask me anything about my work, projects, or expertise. I'm here to help!</p>
        `;
        this.chatContainer.appendChild(welcomeDiv);

        this.dropdownMenu.classList.remove('active');
        
        console.log('Chat cleared');
    }

    async loadChatHistory() {
        try {
            const response = await fetch(`/api/history?sessionId=${this.sessionId}&limit=10`);
            const data = await response.json();

            if (data.success && data.messages && data.messages.length > 0) {
                // Remove welcome message
                const welcomeMsg = this.chatContainer.querySelector('.welcome-message');
                if (welcomeMsg) {
                    welcomeMsg.remove();
                }

                // Add previous messages
                data.messages.forEach(msg => {
                    this.addMessage(msg.userMessage, 'user');
                    this.addMessage(msg.botResponse, 'bot');
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    async checkServerHealth() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();

            if (data.status === 'ok') {
                this.statusElement.textContent = 'Online';
                this.statusElement.style.color = 'var(--success)';
            } else {
                this.statusElement.textContent = 'Issues detected';
                this.statusElement.style.color = 'var(--error)';
            }
        } catch (error) {
            this.statusElement.textContent = 'Offline';
            this.statusElement.style.color = 'var(--error)';
            console.error('Server health check failed:', error);
        }

        // Check again in 30 seconds
        setTimeout(() => this.checkServerHealth(), 30000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ChatBot();
    });
} else {
    new ChatBot();
}
