import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';

const Exchange = () => {
  const [fromCurrency, setFromCurrency] = useState('TON');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState({ TON: 0, USDT: 0 });
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositCurrency, setDepositCurrency] = useState('TON');
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    fetchRate();
    fetchBalance();
  }, []);

  const fetchRate = async () => {
    try {
      const response = await axios.get('/exchange/rate');
      setRate(response.data.rate);
    } catch (error) {
      setError('Failed to fetch exchange rate');
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await axios.get('/auth/me');
      setBalance(response.data.user.balance);
    } catch (error) {
      setError('Failed to fetch balance');
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseFloat(value) > 0 && !isNaN(value))) {
      setAmount(value);
    }
  };

  const handleExchange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError('Amount must be greater than 0');
      setLoading(false);
      return;
    }

    if (amountNum > balance[fromCurrency]) {
      setError(`Insufficient ${fromCurrency} balance`);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/exchange/convert', {
        fromCurrency,
        toCurrency,
        amount: amountNum,
      });

      setSuccess(`Exchange successful! New balance: ${JSON.stringify(response.data.newBalance)}`);
      setAmount('');
      fetchRate();
      fetchBalance();
    } catch (error) {
      setError(error.response?.data?.message || 'Exchange failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    const amountNum = parseFloat(depositAmount);
    if (amountNum <= 0) {
      setError('Amount must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/exchange/deposit', {
        currency: depositCurrency,
        amount: amountNum,
      });

      setSuccess(`Deposit successful! New balance: ${JSON.stringify(response.data.newBalance)}`);
      setDepositAmount('');
      setDepositOpen(false);
      fetchBalance();
    } catch (error) {
      setError(error.response?.data?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = () => {
    return loading || !amount || !rate || parseFloat(amount) <= 0 || parseFloat(amount) > balance[fromCurrency];
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Exchange
        </Typography>
        <Paper sx={{ p: 3, mt: 2 }}>
          {rate && (
            <Typography variant="h6" gutterBottom>
              Current Rate: 1 TON = {rate} USDT
            </Typography>
          )}
          <Typography variant="body1" gutterBottom>
            Your Balance: {balance.TON} TON, {balance.USDT} USDT
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDepositOpen(true)}
            sx={{ mb: 2 }}
          >
            Deposit
          </Button>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <Box component="form" onSubmit={handleExchange}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>From</InputLabel>
              <Select
                value={fromCurrency}
                label="From"
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                <MenuItem value="TON">TON</MenuItem>
                <MenuItem value="USDT">USDT</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>To</InputLabel>
              <Select
                value={toCurrency}
                label="To"
                onChange={(e) => setToCurrency(e.target.value)}
              >
                <MenuItem value="TON">TON</MenuItem>
                <MenuItem value="USDT">USDT</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              sx={{ mb: 2 }}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isButtonDisabled()}
            >
              {loading ? 'Exchanging...' : 'Exchange'}
            </Button>
          </Box>
        </Paper>
      </Box>

      <Dialog open={depositOpen} onClose={() => setDepositOpen(false)}>
        <DialogTitle>Deposit Funds</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Currency</InputLabel>
            <Select
              value={depositCurrency}
              label="Currency"
              onChange={(e) => setDepositCurrency(e.target.value)}
            >
              <MenuItem value="TON">TON</MenuItem>
              <MenuItem value="USDT">USDT</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            sx={{ mt: 2 }}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeposit}
            disabled={loading || !depositAmount || parseFloat(depositAmount) <= 0}
          >
            {loading ? 'Processing...' : 'Deposit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Exchange; 