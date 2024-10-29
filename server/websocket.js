import { redisClient } from './index.js';

export const setupWebSocket = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // Verify token and attach user data to socket
    try {
      // Implement token verification
      socket.user = { id: 'user_id' }; // Replace with actual user data
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room based on branch
    socket.on('join-branch', (branchId) => {
      socket.join(`branch:${branchId}`);
    });

    // Handle real-time order updates
    socket.on('order:update', async (data) => {
      const { orderId, status, branchId } = data;
      
      // Cache order status
      await redisClient.hSet(`order:${orderId}`, {
        status,
        updatedAt: new Date().toISOString()
      });

      // Broadcast to branch room
      io.to(`branch:${branchId}`).emit('order:updated', {
        orderId,
        status,
        updatedAt: new Date().toISOString()
      });
    });

    // Handle inventory updates
    socket.on('inventory:update', async (data) => {
      const { productId, stock, branchId } = data;
      
      // Cache inventory status
      await redisClient.hSet(`product:${productId}`, {
        stock,
        updatedAt: new Date().toISOString()
      });

      // Broadcast to branch room
      io.to(`branch:${branchId}`).emit('inventory:updated', {
        productId,
        stock,
        updatedAt: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};