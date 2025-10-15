// Script to create an admin user
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@autocare.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@autocare.com');
      process.exit(0);
    }
    
    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@autocare.com',
      password: 'admin123', // Will be hashed by the pre-save hook
      phoneNumbers: ['1234567890'],
      address: '123 Admin Street',
      preferredContactMethod: 'email',
      role: 'admin'
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@autocare.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
