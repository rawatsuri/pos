import Order from '../models/Order.js';
import asyncHandler from 'express-async-handler';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await Order.create({
    ...req.body,
    branch: req.user.branch
  });
  
  res.status(201).json(order);
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ branch: req.user.branch })
    .populate('customer')
    .populate('items.product')
    .sort('-createdAt');
  
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  await order.save();

  res.json(order);
});