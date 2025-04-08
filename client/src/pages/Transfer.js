import React, { useState } from 'react';
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
} from '@mui/material';
import axios from 'axios';

const Transfer = () => {
  const [recipient, setRecipient] = useState('');
  const [currency, setCurrency] = useState('TON');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('/api/transfer/send', {
        recipient,
        currency,
        amount: parseFloat(amount),
      });

      setSuccess(`Transfer successful! New balance: ${JSON.stringify(response.data.newBalance)}`);
      setAmount('');
      setRecipient('');
    } catch (error) {
      setError(error.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transfer
        </Typography>
        <Paper sx={{ p: 3, mt: 2 }}>
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
          <Box component="form" onSubmit={handleTransfer}>
            <TextField
              fullWidth
              label="Recipient Email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Currency</InputLabel>
              <Select
                value={currency}
                label="Currency"
                onChange={(e) => setCurrency(e.target.value)}
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
              disabled={loading || !amount || !recipient}
            >
              {loading ? 'Transferring...' : 'Transfer'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Transfer; 