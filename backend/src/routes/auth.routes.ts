import express from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';

const router = express.Router();

// Route for user registration
router.post('/register', register);

// Route for user login
router.post('/login', login);

// Route for refreshing access token
router.post('/refresh-token', refreshToken);

// Route for user logout
router.post('/logout', logout);

export default router;
