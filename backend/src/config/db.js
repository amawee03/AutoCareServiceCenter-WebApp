import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "AutoCare",   // keep this if you want a specific database
      // ❌ remove useNewUrlParser
      // ❌ remove useUnifiedTopology
    });

    console.log("MONGODB CONNECTED SUCCESSFULLY!");
  } catch (error) {
    console.error("Error connecting to MONGODB:", error);
    process.exit(1);
  }
};

export default connectDB;
