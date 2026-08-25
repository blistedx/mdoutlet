import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      console.log(`Connecting to MongoDB URI: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
      await mongoose.connect(mongoUri);
      console.log('MongoDB Connected Successfully');
    } else {
      console.log('No MONGODB_URI provided. Initializing in-memory MongoMemoryServer...');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`MongoMemoryServer Connected Successfully at ${memUri}`);
    }
  } catch (error) {
    console.error('Failed to connect to primary MongoDB. Attempting fallback to MongoMemoryServer...', error.message);
    try {
      if (!mongoMemoryServer) {
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`Fallback MongoMemoryServer Connected Successfully at ${memUri}`);
      }
    } catch (memError) {
      console.error('Critical Database Connection Error:', memError);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
