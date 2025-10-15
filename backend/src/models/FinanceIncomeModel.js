import mongoose from "mongoose";

// Define the schema
const financeIncomeSchema = new mongoose.Schema(
  {
    dateReceived: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1, // ✅ no negative or zero
    },
    category: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["cash", "card", "bankTransfer", "other"], // controlled values
      default: "cash",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "", // optional field
    },
    image: {
      type: String, // will store file path or URL
      default: null,
    },
  },
  {
    timestamps: true, // 🔥 automatically adds createdAt & updatedAt
  }
);

// Create the model
const FinanceIncome = mongoose.model("FinanceIncome", financeIncomeSchema);

export default FinanceIncome;