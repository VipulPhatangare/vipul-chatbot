require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Chat Message Schema
const messageSchema = new mongoose.Schema({
  userMessage: {
    type: String,
    required: true
  },
  botResponse: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionId: String
});

const Message = mongoose.model('Message', messageSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to send message to n8n and get response
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Send to n8n webhook
    const n8nResponse = await axios.post(process.env.N8N_WEBHOOK_URL, {
      message: message,
      sessionId: sessionId || 'default',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });

    // Extract response from n8n
    const botResponse = n8nResponse.data.response || n8nResponse.data.message || n8nResponse.data.output || 'Sorry, I could not process your request.';

    // Save to MongoDB
    const newMessage = new Message({
      userMessage: message,
      botResponse: botResponse,
      sessionId: sessionId || 'default'
    });

    await newMessage.save();
    console.log('✅ Message saved to database');

    // Send response back to client
    res.json({
      success: true,
      response: botResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing chat:', error.message);
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        error: 'Request timeout. Please try again.',
        success: false 
      });
    }

    res.status(500).json({ 
      error: 'Failed to process message. Please check your n8n webhook configuration.',
      success: false,
      details: error.message
    });
  }
});

// Get chat history
app.get('/api/history', async (req, res) => {
  try {
    const { sessionId, limit = 50 } = req.query;
    
    const query = sessionId ? { sessionId } : {};
    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chat history',
      success: false 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});
