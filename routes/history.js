const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get transaction history
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { fromUser: req.user.userId },
        { toUser: req.user.userId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('fromUser', 'email')
    .populate('toUser', 'email');

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ message: 'Error fetching transaction history' });
  }
});

module.exports = router; 