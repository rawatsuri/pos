import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders
} from '../controllers/customer.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(addCustomer);

router.route('/:id')
  .put(updateCustomer)
  .delete(deleteCustomer);

router.route('/:id/orders')
  .get(getCustomerOrders);

export default router;