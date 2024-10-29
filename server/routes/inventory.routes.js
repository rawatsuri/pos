import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { 
  getInventory,
  addProduct,
  updateProduct,
  deleteProduct,
  updateStock
} from '../controllers/inventory.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInventory)
  .post(authorize('admin', 'manager'), addProduct);

router.route('/:id')
  .put(authorize('admin', 'manager'), updateProduct)
  .delete(authorize('admin', 'manager'), deleteProduct);

router.route('/:id/stock')
  .patch(authorize('admin', 'manager', 'staff'), updateStock);

export default router;