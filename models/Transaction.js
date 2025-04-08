const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['transfer', 'exchange'],
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.type === 'transfer';
    }
  },
  fromCurrency: {
    type: String,
    enum: ['TON', 'USDT'],
    required: true
  },
  toCurrency: {
    type: String,
    enum: ['TON', 'USDT'],
    required: function() {
      return this.type === 'exchange';
    }
  },
  amount: {
    type: Number,
    required: true,
    min: 0.0001,
    max: 1000000
  },
  rate: {
    type: Number,
    required: function() {
      return this.type === 'exchange';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ type: 1 });
transactionSchema.index({ fromUser: 1 });
transactionSchema.index({ toUser: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ fromUser: 1, createdAt: -1 });
transactionSchema.index({ toUser: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1, createdAt: -1 });
transactionSchema.index({ fromCurrency: 1, toCurrency: 1, createdAt: -1 });

// Validation middleware
transactionSchema.pre('save', function(next) {
  if (this.type === 'transfer' && !this.toUser) {
    next(new Error('Recipient is required for transfer transactions'));
  }
  if (this.type === 'exchange' && !this.toCurrency) {
    next(new Error('Target currency is required for exchange transactions'));
  }
  if (this.amount <= 0) {
    next(new Error('Amount must be greater than 0'));
  }
  if (this.amount > 1000000) {
    next(new Error('Amount exceeds maximum limit'));
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 