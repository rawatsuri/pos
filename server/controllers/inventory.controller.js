import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

export const getInventory = asyncHandler(async (req, res) => {
  const products = await Product.find({ branch: req.user.branch });
  res.json(products);
});

export const addProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    branch: req.user.branch
  });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  Object.assign(product, req.body);
  await product.save();
  
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.remove();
  res.json({ message: 'Product removed' });
});

export const updateStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.stock = quantity;
  await product.save();
  
  res.json(product);
});