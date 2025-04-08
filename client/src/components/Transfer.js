import React, { useState } from 'react';
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
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Transfer = () => {
  const { user } = useAuth();
  const [toUsername, setToUsername] = useState('');
  const [currency, setCurrency] = useState('TON');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/transfer/send', {
        toUsername,
        currency,
        amount: parseFloat(amount),
      });

      setSuccess('Transfer successful!');
      setToUsername('');
      setAmount('');
    } catch (error) {
      setError(error.response?.data?.message || 'Transfer failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Transfer Funds
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
          <TextField
            fullWidth
            label="Recipient Username"
            value={toUsername}
            onChange={(e) => setToUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Currency</InputLabel>
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              label="Currency"
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
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!toUsername || !amount}
          >
            Transfer
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Transfer; 