import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';

function Home() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h3" gutterBottom>
          Добро пожаловать в TON Exchange
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          Обменивайте TON на USDT и обратно по выгодному курсу
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            color="primary"
            size="large"
          >
            Войти
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            variant="outlined"
            color="primary"
            size="large"
          >
            Регистрация
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Home; 