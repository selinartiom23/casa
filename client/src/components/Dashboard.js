import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Your Balance
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="div">
                {user.balance.ton.toFixed(4)} TON
              </Typography>
              <Typography variant="h4" component="div">
                {user.balance.usdt.toFixed(2)} USDT
              </Typography>
            </Box>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Current rate: 1 TON = {rate?.toFixed(2)} USDT
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/exchange')}
              >
                Exchange
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/transfer')}
              >
                Transfer
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/history')}
              >
                View History
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 