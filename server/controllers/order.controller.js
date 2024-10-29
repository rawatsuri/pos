import Order from '../models/Order.js';
import { redisClient } from '../index.js';
import asyncHandler from 'express-async-handler';

// Cache TTL in seconds
const CACHE_TTL = 300; // 5 minutes

export const createOrder = asyncHandler(async (req, res) => {
  const order = await Order.create({
    ...req.body,
    branch: req.user.branch
  });

  // Cache the new order
  await redisClient.setEx(
    `order:${order._id}`,
    CACHE_TTL,
    JSON.stringify(order)
  );
  
  // Invalidate orders list cache
  await redisClient.del(`orders:${req.user.branch}`);
  
  res.status(201).json(order);
});

export const getOrders = asyncHandler(async (req, res) => {
  const cacheKey = `orders:${req.user.branch}`;
  
  // Try to get from cache first
  const cachedOrders = await redisClient.get(cacheKey);
  if (cachedOrders) {
    return res.json(JSON.parse(cachedOrders));
  }

  // If not in cache, get from database
  const orders = await Order.find({ branch: req.user.branch })
    .populate('customer', 'name email phone')
    .populate('items.product', 'name price')
    .sort('-createdAt')
    .lean();

  // Cache the results
  await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(orders));
  
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.branch.toString() !== req.user.branch.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  order.status = status;
  await order.save();

  // Update cache
  await redisClient.setEx(
    `order:${order._id}`,
    CACHE_TTL,
    JSON.stringify(order)
  );
  await redisClient.del(`orders:${req.user.branch}`);

  res.json(order);
});

export const syncOrders = asyncHandler(async (req, res) => {
  const { orders } = req.body;
  const results = [];

  for (const order of orders) {
    try {
      if (order.syncStatus === 'pending') {
        let existingOrder = await Order.findById(order.id);
        
        if (existingOrder) {
          // Update existing order
          Object.assign(existingOrder, order);
          await existingOrder.save();
          results.push({ id: order.id, status: 'synced' });
        } else {
          // Create new order
          const newOrder = await Order.create({
            ...order,
            branch: req.user.branch
          });
          results.push({ id: newOrder._id, status: 'synced' });
        }
      }
    } catch (error) {
      console.error(`Error syncing order ${order.id}:`, error);
      results.push({ id: order.id, status: 'failed', error: error.message });
    }
  }

  // Invalidate cache
  await redisClient.del(`orders:${req.user.branch}`);

  res.json({ results });
});