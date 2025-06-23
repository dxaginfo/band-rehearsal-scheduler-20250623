import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/connection';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, instrument } = req.body;
    
    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const userId = uuidv4();
    const newUser = {
      id: userId,
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      phone,
      default_instrument: instrument,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    await db('users').insert(newUser);
    
    // Generate tokens
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    
    // Store refresh token
    await storeRefreshToken(userId, refreshToken);
    
    // Return success response
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        instrument
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);
    
    // Return success response
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        instrument: user.default_instrument
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET) as { userId: string };
      
      // Check if token is in database
      const tokenRecord = await db('refresh_tokens')
        .where({ user_id: decoded.userId, token: refreshToken })
        .first();
      
      if (!tokenRecord) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }
      
      // Generate new access token
      const newAccessToken = generateAccessToken(decoded.userId);
      
      // Return success response
      res.status(200).json({
        accessToken: newAccessToken
      });
    } catch (error) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Token refresh failed', error: error.message });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }
    
    // Remove refresh token from database
    await db('refresh_tokens').where({ token: refreshToken }).del();
    
    // Return success response
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

// Generate access token
const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '1h'
  });
};

// Generate refresh token
const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
  });
};

// Store refresh token in database
const storeRefreshToken = async (userId: string, token: string) => {
  // Delete existing tokens for this user
  await db('refresh_tokens').where({ user_id: userId }).del();
  
  // Insert new token
  await db('refresh_tokens').insert({
    id: uuidv4(),
    user_id: userId,
    token,
    created_at: new Date(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
};
