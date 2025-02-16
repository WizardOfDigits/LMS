import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const dbUrl: string = process.env.DB_URL || "";

const connectDB = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(dbUrl);
    console.log(`Database connected with ${connection.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

export default connectDB;
