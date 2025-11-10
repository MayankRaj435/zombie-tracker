import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  connectAWS,
  disconnectAWS,
  deleteAccount,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authMiddleware, getCurrentUser);
router.post('/connect-aws', authMiddleware, connectAWS);
router.post('/disconnect-aws', authMiddleware, disconnectAWS);
router.delete('/delete-account', authMiddleware, deleteAccount);

export default router;

