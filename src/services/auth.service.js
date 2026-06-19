const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

/**
 * Generate JWT for an authenticated user.
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

/**
 * Register a new user.
 * Hashes user password and saves user to database.
 */
const registerUser = async (fullName, email, password) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error('Email address is already in use');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user and select only non-sensitive fields
  const newUser = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
    },
  });

  return newUser;
};

/**
 * Validate credentials and log in user.
 */
const loginUser = async (email, password) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate token
  const token = generateToken(user.id);

  // Return user context and token
  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
  generateToken,
};
