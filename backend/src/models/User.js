// src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumbers: [
      {
        type: String,
        trim: true,
      },
    ],
    address: {
      type: String,
      trim: true,
    },
    preferredContactMethod: {
      type: String,
      enum: ["SMS", "email", "call"],
      default: "email",
    },
    role: {
      type: String,
      enum: ["customer", "finance_manager", "inventory_manager", "receptionist", "service_advisor", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
