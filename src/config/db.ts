import mongoose from "mongoose";

const uri = process.env.MONGODB_URI as string;

async function connectDB() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
    }
}

export { connectDB }