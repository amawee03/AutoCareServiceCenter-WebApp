import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/models/User.js";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seedCustomer() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Check if customer already exists
    const existingCustomer = await User.findOne({ email: "customer@example.com" });
    if (existingCustomer) {
      console.log("⚠️ Customer already exists:", existingCustomer.email);
      mongoose.connection.close();
      return;
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash("customer123", 10);

    // Create customer user
    const customer = new User({
      name: "Test Customer",
      email: "customer@example.com",
      password: hashedPassword,
      phoneNumbers: ["+94112223345"],
      address: "123 Customer Street, City",
      preferredContactMethod: "email",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await customer.save();
    console.log("✅ Customer inserted successfully!");
    console.log("📧 Email: customer@example.com");
    console.log("🔑 Password: customer123");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error inserting customer:", err);
    mongoose.connection.close();
  }
}


seedCustomer();

