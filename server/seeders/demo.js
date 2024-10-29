import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const seedDemoUsers = async () => {
  try {
    // Check if demo users already exist
    const adminExists = await User.findOne({ email: 'admin@demo.com' });
    if (adminExists) return;

    const demoUsers = [
      {
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'admin'
      },
      {
        name: 'Demo Manager',
        email: 'manager@demo.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'manager'
      },
      {
        name: 'Demo Staff',
        email: 'staff@demo.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'staff'
      }
    ];

    await User.insertMany(demoUsers);
    console.log('Demo users seeded successfully');
  } catch (error) {
    console.error('Error seeding demo users:', error);
  }
};