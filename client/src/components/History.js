import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const History = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/transfer/history');
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionType = (type) => {
    return type === 'exchange' ? 'Exchange' : 'Transfer';
  };

  const getTransactionAmount = (transaction) => {
    if (transaction.type === 'exchange') {
      return `${transaction.amount} ${transaction.fromCurrency} → ${transaction.rate * transaction.amount} ${transaction.toCurrency}`;
    } else {
      return `${transaction.amount} ${transaction.fromCurrency}`;
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Transaction History
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>{getTransactionType(transaction.type)}</TableCell>
                    <TableCell>
                      {transaction.type === 'transfer' ? (
                        <>
                          To: {transaction.toUser.username}
                          <br />
                          {getTransactionAmount(transaction)}
                        </>
                      ) : (
                        getTransactionAmount(transaction)
                      )}
                    </TableCell>
                    <TableCell>{transaction.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default History; 