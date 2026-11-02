import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is required");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully"); 
    }
    catch {
        throw new Error("MongoDB connection failed. Check MONGO_URI and database availability.");
    }
}


export default connectDB;
