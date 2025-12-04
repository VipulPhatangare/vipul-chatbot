require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Validate environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ FATAL: MONGODB_URI is not set in environment variables');
  process.exit(1);
}

if (!process.env.N8N_WEBHOOK_URL) {
  console.error('⚠️ WARNING: N8N_WEBHOOK_URL is not set in environment variables');
}

console.log('🔧 Environment Check:');
console.log('  - MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('  - N8N_WEBHOOK_URL:', process.env.N8N_WEBHOOK_URL ? '✅ Set' : '❌ Missing');
console.log('  - PORT:', PORT);

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
.catch(err => {
  console.error('❌ MongoDB connection error:');
  console.error('Error Name:', err.name);
  console.error('Error Message:', err.message);
  console.error('Error Stack:', err.stack);
  console.error('Full Error:', err);
  console.error('\n⚠️ Make sure MongoDB URI is correct in environment variables');
});

// MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

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
      return res.status(400).json({ error: 'Message is required', success: false });
    }

    if (!process.env.N8N_WEBHOOK_URL) {
      console.error('❌ N8N_WEBHOOK_URL not configured');
      return res.status(500).json({ 
        error: 'Chatbot configuration error. Please contact administrator.',
        success: false,
        details: 'Webhook URL not configured'
      });
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

    // Send response back to client
    res.json({
      success: true,
      response: botResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing chat:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Stack:', error.stack);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
      console.error('Response Headers:', error.response.headers);
    }
    
    if (error.request) {
      console.error('Request Details:', error.request);
    }
    
    console.error('Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        error: 'Request timeout. Please try again.',
        success: false 
      });
    }

    let errorMessage = 'Failed to process message.';
    let statusCode = 500;
    
    if (error.response) {
      statusCode = error.response.status;
      errorMessage = `Webhook error: ${error.response.statusText || 'Unknown error'}`;
    } else if (error.request) {
      errorMessage = 'Unable to reach webhook. Please check your network connection.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Webhook URL not found. Please check configuration.';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      success: false,
      details: error.message,
      webhook: process.env.N8N_WEBHOOK_URL ? 'configured' : 'missing'
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
    console.error('❌ Error fetching history:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Full Error:', error);
    
    res.status(500).json({ 
      error: 'Failed to fetch chat history',
      success: false 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const webhookConfigured = !!process.env.N8N_WEBHOOK_URL;
  
  res.json({ 
    status: 'ok', 
    mongodb: mongoStatus,
    webhook: webhookConfigured ? 'configured' : 'not configured',
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      port: PORT
    },
    timestamp: new Date().toISOString()
  });
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:');
  console.error('Error Name:', err.name);
  console.error('Error Message:', err.message);
  console.error('Error Stack:', err.stack);
  
  res.status(500).json({
    error: 'Internal server error',
    success: false,
    details: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});
