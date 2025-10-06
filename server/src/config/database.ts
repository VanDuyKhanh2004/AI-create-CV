import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in .env file');
}

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected successfully!');
        
        // Lấy thông tin về database
        const connection = mongoose.connection;
        console.log(`📊 Connected to database: ${connection.name}`);
        console.log(`📍 Host: ${connection.host}`);
        console.log(`🔌 Port: ${connection.port || 'Default'}`);
        
        // Lắng nghe các sự kiện
        connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

    } catch (error) {
        console.error('❌ Connection error:', error);
        process.exit(1);
    }
}

export default connectDB;