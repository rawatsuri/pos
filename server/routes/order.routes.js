import express from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('admin', 'staff'), createOrder)
  .get(getOrders);

router.route('/:id/status')
  .patch(authorize('admin', 'staff'), updateOrderStatus);

export default router;