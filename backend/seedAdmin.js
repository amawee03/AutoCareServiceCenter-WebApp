import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/models/User.js";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seedAdmin() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists:", existingAdmin.email);
      mongoose.connection.close();
      return;
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash("admin123", 10); // Change password if needed

    // Create admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      phoneNumbers: ["+94112223344"],
      address: "Admin Headquarters",
      preferredContactMethod: "email",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await admin.save();
    console.log("✅ Admin inserted successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error inserting admin:", err);
    mongoose.connection.close();
  }
}

// Run the seeder
seedAdmin();
