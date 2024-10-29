import express from 'express';
import { 
  createOrder, 
  getOrders, 
  updateOrderStatus,
  syncOrders
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('admin', 'staff'), createOrder)
  .get(getOrders);

router.route('/:id/status')
  .patch(authorize('admin', 'staff'), updateOrderStatus);

router.route('/sync')
  .post(authorize('admin', 'staff'), syncOrders);

export default router;