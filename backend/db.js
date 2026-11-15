const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        const conn = await mongoose.connect(uri);
        console.log(`Database connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database connection error: " + error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
