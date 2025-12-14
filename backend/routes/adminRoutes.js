import express from 'express';
import {
  adminLogin,
  getAllUsers,
  getDashboardStats,
  loginAsUser,
  getAvailablePlans,
  changeUserPlan
} from '../controllers/adminController.js';

import { isAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Public
router.post('/login', adminLogin);

// Protected
router.get('/users', isAdmin, getAllUsers);
router.get('/stats', isAdmin, getDashboardStats);
router.post('/login-as-user', isAdmin, loginAsUser);

// New plan routes
router.get('/user/:id/available-plans', isAdmin, getAvailablePlans);
router.patch('/user/:id/change-plan', isAdmin, changeUserPlan);

export default router;
