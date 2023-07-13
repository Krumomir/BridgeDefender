import mongoose from "mongoose";
require('dotenv').config()

const uri = process.env.MONGODB_URI;

async function connectDB() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
    }
}

export { connectDB }