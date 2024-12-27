import mongoose from "mongoose";

export const commectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDb connecteed:${conn.connection.host}`);
    } catch (error){
        console.log("MongoDB connection error:", error);
    }
};