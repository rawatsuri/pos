import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import asyncHandler from 'express-async-handler';

export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ branch: req.user.branch });
  res.json(customers);
});

export const addCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({
    ...req.body,
    branch: req.user.branch
  });
  res.status(201).json(customer);
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  Object.assign(customer, req.body);
  await customer.save();
  
  res.json(customer);
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  await customer.remove();
  res.json({ message: 'Customer removed' });
});

export const getCustomerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 
    customer: req.params.id,
    branch: req.user.branch 
  }).populate('items.product');
  
  res.json(orders);
});