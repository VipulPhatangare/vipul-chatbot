# Vipul's Personal AI Chatbot 🤖

A modern, responsive chatbot interface with n8n workflow integration, Node.js backend, and MongoDB database. Features include real-time chat, typing animations, and persistent chat history.

## ✨ Features

- 🎨 **Modern UI/UX** - Beautiful gradient design with smooth animations
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Real-time Chat** - Instant communication with typing indicators
- 🔗 **n8n Integration** - Connect to your n8n workflows via webhook
- 💾 **MongoDB Storage** - Persistent chat history
- 📝 **Chat Export** - Download your conversations
- 🎭 **Typing Animation** - Character-by-character bot responses
- 🌐 **Session Management** - Track individual chat sessions

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- n8n workflow with webhook configured

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd "c:\Users\vipul\OneDrive\Desktop\web dev\Collage projects\vipul-chatbot"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy `.env.example` to `.env`:
   ```bash
   Copy-Item .env.example .env
   ```

   Edit `.env` and update the following:
   ```env
   MONGODB_URI=mongodb://localhost:27017/vipul-chatbot
   PORT=3000
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
   BOT_NAME=Vipul's Assistant
   ```

4. **Start MongoDB:**
   
   Make sure MongoDB is running on your system:
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud) - just update MONGODB_URI in .env
   ```

5. **Start the application:**
   ```bash
   npm start
   
   # Or for development with auto-reload:
   npm run dev
   ```

6. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 🔧 n8n Webhook Setup

### Step 1: Create n8n Workflow

1. Open your n8n instance
2. Create a new workflow
3. Add a **Webhook** node as the trigger

### Step 2: Configure Webhook

1. Set **HTTP Method** to `POST`
2. Set **Path** to a unique identifier (e.g., `/chatbot`)
3. **Response Mode**: "Respond to Webhook"

### Step 3: Process the Input

Add nodes to process the incoming message. Example structure:

```
Webhook → [Your AI/Processing Logic] → Respond to Webhook
```

Your webhook should expect this JSON structure:
```json
{
  "message": "User's question",
  "sessionId": "session_id",
  "timestamp": "2025-12-04T10:30:00.000Z"
}
```

### Step 4: Format Response

Your n8n workflow should return JSON in one of these formats:

**Option 1 (Recommended):**
```json
{
  "response": "Bot's answer here"
}
```

**Option 2:**
```json
{
  "message": "Bot's answer here"
}
```

**Option 3:**
```json
{
  "output": "Bot's answer here"
}
```

### Step 5: Copy Webhook URL

1. Copy the Production Webhook URL
2. Paste it in your `.env` file as `N8N_WEBHOOK_URL`

### Example n8n Workflow

Here's a simple example workflow structure:

1. **Webhook Node** (Trigger)
   - Method: POST
   - Path: /chatbot

2. **Function Node** (Optional - for processing)
   ```javascript
   const userMessage = $json.message;
   const sessionId = $json.sessionId;
   
   // Your custom logic here
   let response = "Processing your request...";
   
   return {
     response: response,
     sessionId: sessionId
   };
   ```

3. **HTTP Request Node** (Optional - call external API)
   - Connect to OpenAI, Claude, or your custom AI service
   - Pass the user message
   - Get AI response

4. **Respond to Webhook Node**
   - Response Body: `{{ $json }}`

## 📁 Project Structure

```
vipul-chatbot/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styling and animations
│   └── script.js       # Frontend JavaScript
├── server.js           # Node.js/Express backend
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## 🎨 Customization

### Change Colors

Edit `public/styles.css` and modify the CSS variables:

```css
:root {
    --primary-color: #6366f1;
    --primary-dark: #4f46e5;
    --background: #0f172a;
    /* ... more colors ... */
}
```

### Modify Bot Name

Update in `.env`:
```env
BOT_NAME=Your Bot Name
```

### Adjust Typing Speed

In `public/script.js`, find the `addBotMessageWithTyping` method:

```javascript
const typingSpeed = 30; // Change this value (milliseconds per character)
```

### Change Avatar Icons

In `public/script.js`, modify the emoji icons:

```javascript
avatar.textContent = sender === 'user' ? '👤' : '🤖';
```

## 🔌 API Endpoints

### POST `/api/chat`
Send a message and get a response.

**Request:**
```json
{
  "message": "Hello!",
  "sessionId": "optional_session_id"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Hi! How can I help you?",
  "timestamp": "2025-12-04T10:30:00.000Z"
}
```

### GET `/api/history`
Retrieve chat history.

**Query Parameters:**
- `sessionId` (optional): Filter by session
- `limit` (optional): Number of messages (default: 50)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "userMessage": "Hello",
      "botResponse": "Hi there!",
      "timestamp": "2025-12-04T10:30:00.000Z"
    }
  ]
}
```

### GET `/api/health`
Check server health.

**Response:**
```json
{
  "status": "ok",
  "mongodb": "connected",
  "timestamp": "2025-12-04T10:30:00.000Z"
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### n8n Webhook Not Working

- Verify webhook URL is correct in `.env`
- Check n8n workflow is activated
- Test webhook directly using Postman or curl
- Check n8n logs for errors

### Port Already in Use

Change the port in `.env`:
```env
PORT=3001
```

### CORS Issues

The server already has CORS enabled. If you still face issues, check your n8n webhook CORS settings.

## 📝 License

MIT License - feel free to use this for personal or commercial projects!

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📧 Contact

For questions or support, reach out to Vipul.

---

**Made with ❤️ by Vipul**
