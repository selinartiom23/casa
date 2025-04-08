# TON Exchange Application

A web application for exchanging TON and USDT, with user registration, internal transfers, and transaction history.

## Features

- User registration and authentication
- Real-time TON/USDT price tracking from CoinGecko
- Exchange between TON and USDT
- Internal transfers between users
- Transaction history
- Modern UI with Material-UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/ton-exchange
   JWT_SECRET=your-secret-key
   ```

## Running the Application

1. Start the backend server:
   ```bash
   npm start
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Exchange
- GET `/api/exchange/rate` - Get current TON/USDT rate
- POST `/api/exchange/convert` - Convert between TON and USDT

### Transfer
- POST `/api/transfer/send` - Send funds to another user
- GET `/api/transfer/history` - Get transaction history

## Technologies Used

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - JWT for authentication

- Frontend:
  - React
  - Material-UI
  - React Router
  - Axios

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected routes
- Input validation
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 