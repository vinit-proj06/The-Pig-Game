require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "final" directory (your frontend)
app.use(express.static(path.join(__dirname, 'final')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pig-game";
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// MongoDB Schema & Model for Pig Game Scores
const scoreSchema = new mongoose.Schema({
  player: { type: String, required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', scoreSchema);

// --- API Endpoints ---

// 1. Fetch Top Highscores (Limit 10)
app.get('/api/scores', async (req, res) => {
  try {
    const topScores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(topScores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve scores' });
  }
});

// 2. Save a newly won Game's Score
app.post('/api/scores', async (req, res) => {
  try {
    const { player, score } = req.body;
    
    // Validate request
    if (!player || score === undefined) {
      return res.status(400).json({ error: 'Player name and score are required' });
    }

    const newScore = new Score({ player, score });
    await newScore.save();
    
    res.status(201).json(newScore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// Handle all other requests by sending back the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'final', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
