import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} from '../controllers/employee.controller.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'manager'));

router.route('/')
  .get(getEmployees)
  .post(addEmployee);

router.route('/:id')
  .put(updateEmployee)
  .delete(deleteEmployee);

router.route('/:id/stats')
  .get(getEmployeeStats);

export default router;