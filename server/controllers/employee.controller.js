import User from '../models/User.js';
import Order from '../models/Order.js';
import asyncHandler from 'express-async-handler';

export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await User.find({ 
    branch: req.user.branch,
    role: { $ne: 'admin' }
  }).select('-password');
  res.json(employees);
});

export const addEmployee = asyncHandler(async (req, res) => {
  const employee = await User.create({
    ...req.body,
    branch: req.user.branch
  });
  res.status(201).json(employee);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  Object.assign(employee, req.body);
  await employee.save();
  
  res.json(employee);
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  await employee.remove();
  res.json({ message: 'Employee removed' });
});

export const getEmployeeStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    { $match: { createdBy: req.params.id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSales: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' }
      }
    }
  ]);
  
  res.json(stats[0] || {
    totalOrders: 0,
    totalSales: 0,
    averageOrderValue: 0
  });
});