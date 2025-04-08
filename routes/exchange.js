const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const rateLimit = require('express-rate-limit');

// Middleware to verify JWT token
const auth = require('../middleware/auth');

// Rate limiting for API calls
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Cache for exchange rate
let rateCache = {
  value: null,
  timestamp: null,
  expiry: 60000 // 1 minute
};

// Constants
const MAX_EXCHANGE_AMOUNT = 1000000; // Maximum exchange amount
const MIN_EXCHANGE_AMOUNT = 0.0001;  // Minimum exchange amount

// Get current TON/USDT rate from CoinGecko
router.get('/rate', apiLimiter, async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached rate if it's still valid
    if (rateCache.value && rateCache.timestamp && 
        (now - rateCache.timestamp) < rateCache.expiry) {
      return res.json({ rate: rateCache.value });
    }

    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'the-open-network',
        vs_currencies: 'usd'
      },
      timeout: 5000 // 5 second timeout
    });

    if (!response.data || !response.data['the-open-network'] || !response.data['the-open-network'].usd) {
      throw new Error('Invalid response from CoinGecko API');
    }

    const rate = response.data['the-open-network'].usd;
    
    // Update cache
    rateCache = {
      value: rate,
      timestamp: now,
      expiry: 60000
    };

    res.json({ rate });
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Return cached rate if available, even if expired
    if (rateCache.value) {
      return res.json({ rate: rateCache.value, warning: 'Using cached rate' });
    }
    res.status(500).json({ message: 'Error fetching exchange rate', error: error.message });
  }
});

// Exchange TON to USDT or vice versa
router.post('/convert', [auth, apiLimiter], async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!fromCurrency || !toCurrency || !amount) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    if (numAmount > MAX_EXCHANGE_AMOUNT) {
      return res.status(400).json({ message: `Amount exceeds maximum limit of ${MAX_EXCHANGE_AMOUNT}` });
    }

    if (numAmount < MIN_EXCHANGE_AMOUNT) {
      return res.status(400).json({ message: `Amount must be at least ${MIN_EXCHANGE_AMOUNT}` });
    }

    // Get current rate
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'the-open-network',
        vs_currencies: 'usd'
      },
      timeout: 5000
    });

    if (!response.data || !response.data['the-open-network'] || !response.data['the-open-network'].usd) {
      throw new Error('Invalid response from CoinGecko API');
    }

    const rate = response.data['the-open-network'].usd;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate converted amount
    let convertedAmount;
    if (fromCurrency === 'TON' && toCurrency === 'USDT') {
      convertedAmount = numAmount * rate;
    } else if (fromCurrency === 'USDT' && toCurrency === 'TON') {
      convertedAmount = numAmount / rate;
    } else {
      return res.status(400).json({ message: 'Invalid currency pair' });
    }

    // Check if user has enough balance
    if (user.balance[fromCurrency.toLowerCase()] < numAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Start transaction
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Update user balance
      user.balance[fromCurrency.toLowerCase()] -= numAmount;
      user.balance[toCurrency.toLowerCase()] += convertedAmount;
      await user.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        type: 'exchange',
        fromUser: userId,
        fromCurrency,
        toCurrency,
        amount: numAmount,
        rate,
        status: 'completed'
      });

      await transaction.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.json({
        message: 'Exchange successful',
        convertedAmount,
        newBalance: user.balance
      });
    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Exchange error:', error);
    res.status(500).json({ message: 'Exchange failed', error: error.message });
  }
});

// Маршрут для пополнения баланса
router.post('/deposit', auth, async (req, res) => {
  try {
    const { currency, amount } = req.body;

    if (!currency || !amount) {
      return res.status(400).json({ message: 'Currency and amount are required' });
    }

    if (!['TON', 'USDT'].includes(currency)) {
      return res.status(400).json({ message: 'Invalid currency' });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.balance[currency] = (user.balance[currency] || 0) + amountNum;
    await user.save();

    // Создаем запись о транзакции
    const transaction = new Transaction({
      type: 'deposit',
      fromUser: user._id,
      toUser: user._id,
      fromCurrency: currency,
      toCurrency: currency,
      amount: amountNum,
      rate: 1,
      status: 'completed'
    });
    await transaction.save();

    res.json({
      message: 'Deposit successful',
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 