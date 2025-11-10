import { Response } from 'express';
import { prisma } from '../prisma';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { encrypt } from '../utils/encryption';
import { AuthRequest } from '../middleware/authMiddleware';
import { RegisterRequest, LoginRequest, ConnectAWSRequest } from '../types/auth';

/**
 * Register a new user
 */
export async function register(req: AuthRequest, res: Response) {
  try {
    const { email, password, name }: RegisterRequest = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        error: 'Missing required fields',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long',
        error: 'Invalid password',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists',
        error: 'Email already registered',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        awsConnected: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        awsConnected: user.awsConnected,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'An error occurred during registration',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Login user
 */
export async function login(req: AuthRequest, res: Response) {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        error: 'Missing required fields',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
        error: 'User not found',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
        error: 'Invalid password',
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        awsConnected: user.awsConnected,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'An error occurred during login',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Get current user info
 */
export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated',
        error: 'No user ID in request',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        awsConnected: true,
        awsRegion: true,
        awsConnectedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: 'User does not exist',
      });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      message: 'An error occurred while retrieving user',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Connect AWS account
 */
export async function connectAWS(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated',
        error: 'No user ID in request',
      });
    }

    const { awsAccessKeyId, awsSecretAccessKey, awsRegion }: ConnectAWSRequest = req.body;

    // Validation
    if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion) {
      return res.status(400).json({
        message: 'AWS Access Key ID, Secret Access Key, and Region are required',
        error: 'Missing required fields',
      });
    }

    // Encrypt credentials
    const encryptedAccessKeyId = encrypt(awsAccessKeyId);
    const encryptedSecretAccessKey = encrypt(awsSecretAccessKey);

    // Update user with AWS credentials
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        awsAccessKeyId: encryptedAccessKeyId,
        awsSecretAccessKey: encryptedSecretAccessKey,
        awsRegion,
        awsConnected: true,
        awsConnectedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        awsConnected: true,
        awsRegion: true,
        awsConnectedAt: true,
      },
    });

    res.status(200).json({
      message: 'AWS account connected successfully',
      user,
    });
  } catch (error) {
    console.error('Connect AWS error:', error);
    res.status(500).json({
      message: 'An error occurred while connecting AWS account',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Disconnect AWS account
 */
export async function disconnectAWS(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated',
        error: 'No user ID in request',
      });
    }

    // Clear AWS credentials
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        awsAccessKeyId: null,
        awsSecretAccessKey: null,
        awsRegion: null,
        awsConnected: false,
        awsConnectedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        awsConnected: true,
      },
    });

    res.status(200).json({
      message: 'AWS account disconnected successfully',
      user,
    });
  } catch (error) {
    console.error('Disconnect AWS error:', error);
    res.status(500).json({
      message: 'An error occurred while disconnecting AWS account',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Delete user account
 * This will delete the user and all associated data (cascade delete)
 */
export async function deleteAccount(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated',
        error: 'No user ID in request',
      });
    }

    // Delete user (cascade delete will remove all associated data)
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      message: 'An error occurred while deleting account',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

