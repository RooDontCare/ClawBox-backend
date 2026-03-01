const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Save data directory
const SAVE_DIR = path.join(__dirname, '../saves');

// Ensure saves directory exists
async function ensureSaveDir() {
  try {
    await fs.mkdir(SAVE_DIR, { recursive: true });
  } catch (error) {
    // Ignore if directory already exists
  }
}

ensureSaveDir();

// Generate a save ID
function generateSaveId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// POST /api/save - Save game state
router.post('/api/save', async (req, res) => {
  try {
    const { playerId, saveData } = req.body;

    // Validate input
    if (!playerId || typeof playerId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid player ID'
      });
    }

    if (!saveData || typeof saveData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid save data'
      });
    }

    const saveId = generateSaveId();
    const timestamp = new Date().toISOString();
    const savePath = path.join(SAVE_DIR, `${playerId}.json`);

    // Save to file
    const saveRecord = {
      saveId,
      playerId,
      saveData,
      timestamp
    };

    await fs.writeFile(savePath, JSON.stringify(saveRecord, null, 2));

    res.json({
      success: true,
      saveId,
      timestamp
    });

  } catch (error) {
    console.error('Save Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to save game'
    });
  }
});

// GET /api/load?playerId=xxx - Load game state
router.get('/api/load', async (req, res) => {
  try {
    const { playerId } = req.query;

    // Validate input
    if (!playerId || typeof playerId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid player ID'
      });
    }

    const savePath = path.join(SAVE_DIR, `${playerId}.json`);

    // Check if save file exists
    try {
      const saveContent = await fs.readFile(savePath, 'utf-8');
      const saveRecord = JSON.parse(saveContent);

      res.json({
        success: true,
        saveData: saveRecord.saveData,
        timestamp: saveRecord.timestamp,
        saveId: saveRecord.saveId
      });

    } catch (error) {
      if (error.code === 'ENOENT') {
        // No save found
        return res.json({
          success: true,
          saveData: null,
          timestamp: null,
          saveId: null
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Load Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load game'
    });
  }
});

module.exports = router;
