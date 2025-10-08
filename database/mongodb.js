import mongoose from "mongoose";
import { DB_URL, NODE_ENV } from "../config/env.js";

if (!DB_URL) {
  throw new Error("DB_URL is not defined in environment variables");
}

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log(`MongoDB connected successfully in ${NODE_ENV} environment`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Do not exit; keep the server running to avoid nodemon crash loop
  }
};

export default connectDB;
