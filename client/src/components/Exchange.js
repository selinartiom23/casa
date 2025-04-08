import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Exchange = () => {
  const { user } = useAuth();
  const [fromCurrency, setFromCurrency] = useState('TON');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/exchange/rate');
        setRate(response.data.rate);
      } catch (error) {
        console.error('Error fetching rate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleCurrencyChange = (event) => {
    const newFromCurrency = event.target.value;
    setFromCurrency(newFromCurrency);
    setToCurrency(newFromCurrency === 'TON' ? 'USDT' : 'TON');
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/exchange/convert', {
        fromCurrency,
        toCurrency,
        amount: parseFloat(amount),
      });

      setSuccess('Exchange successful!');
      setAmount('');
    } catch (error) {
      setError(error.response?.data?.message || 'Exchange failed');
    }
  };

  const calculateConvertedAmount = () => {
    if (!amount || !rate) return '';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '';

    if (fromCurrency === 'TON' && toCurrency === 'USDT') {
      return (numAmount * rate).toFixed(2);
    } else if (fromCurrency === 'USDT' && toCurrency === 'TON') {
      return (numAmount / rate).toFixed(4);
    }
    return '';
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Exchange
        </Typography>
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
        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>From</InputLabel>
            <Select
              value={fromCurrency}
              onChange={handleCurrencyChange}
              label="From"
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
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>To</InputLabel>
            <Select
              value={toCurrency}
              label="To"
              disabled
            >
              <MenuItem value={toCurrency}>{toCurrency}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Converted Amount"
            value={calculateConvertedAmount()}
            disabled
            sx={{ mb: 2 }}
          />
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current rate: 1 TON = {rate?.toFixed(2)} USDT
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!amount || loading}
          >
            Exchange
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Exchange; 