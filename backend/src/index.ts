import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import bandRoutes from './routes/band.routes';
import rehearsalRoutes from './routes/rehearsal.routes';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bands', bandRoutes);
app.use('/api/rehearsals', rehearsalRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join a band room
  socket.on('join_band', (bandId) => {
    socket.join(`band:${bandId}`);
    console.log(`${socket.id} joined band:${bandId}`);
  });
  
  // Leave a band room
  socket.on('leave_band', (bandId) => {
    socket.leave(`band:${bandId}`);
    console.log(`${socket.id} left band:${bandId}`);
  });
  
  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io }; // Export for use in other files
