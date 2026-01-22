import mongoose from 'mongoose';

// Models
export { User } from './models/User';
export { Room } from './models/Room';
export { Chat } from './models/Chat';

// Types
export type { IUser } from './models/User';
export type { IRoom } from './models/Room';
export type { IChat } from './models/Chat';

// Database connection
let isConnected = false;

// export const connectDB = async () => {
//   if (isConnected) {
//     console.log('✅ MongoDB already connected');
//     return;
//   }

//   try {
//     const mongoUri = process.env.DATABASE_URL;
    
//     if (!mongoUri) {
//       throw new Error('DATABASE_URL is not defined');
//     }

//     await mongoose.connect(mongoUri);
//     isConnected = true;
//     console.log('✅ MongoDB connected successfully');
//   } catch (error) {
//     console.error('❌ MongoDB connection failed:', error);
//     throw error;
//   }
// };

export const connectDB = async () => {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    const mongoUri = process.env.DATABASE_URL;
    
    console.log('📍 DATABASE_URL value:', mongoUri); // DEBUG
    console.log('📍 First 20 chars:', mongoUri?.substring(0, 20)); // DEBUG
    
    if (!mongoUri) {
      throw new Error('DATABASE_URL is not defined');
    }

    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};