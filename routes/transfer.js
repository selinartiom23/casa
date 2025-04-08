const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Middleware to verify JWT token
const auth = require('../middleware/auth');

// Transfer funds between users
router.post('/send', auth, async (req, res) => {
  try {
    const { toUsername, currency, amount } = req.body;
    const fromUserId = req.user.userId;

    // Find recipient
    const recipient = await User.findOne({ username: toUsername });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Find sender
    const sender = await User.findById(fromUserId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Check if sender has enough balance
    if (sender.balance[currency.toLowerCase()] < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update balances
    sender.balance[currency.toLowerCase()] -= amount;
    recipient.balance[currency.toLowerCase()] += amount;

    await sender.save();
    await recipient.save();

    // Create transaction record
    const transaction = new Transaction({
      type: 'transfer',
      fromUser: fromUserId,
      toUser: recipient._id,
      fromCurrency: currency,
      toCurrency: currency,
      amount,
      status: 'completed'
    });

    await transaction.save();

    res.json({
      message: 'Transfer successful',
      newBalance: sender.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Transfer failed', error: error.message });
  }
});

// Get user's transfer history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const transactions = await Transaction.find({
      $or: [
        { fromUser: userId },
        { toUser: userId }
      ],
      type: 'transfer'
    })
    .sort({ createdAt: -1 })
    .populate('fromUser', 'username')
    .populate('toUser', 'username');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transfer history', error: error.message });
  }
});

module.exports = router; 