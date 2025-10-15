// models/FinanceExpenseModel.js
import mongoose from "mongoose";

const financeExpenseSchema = new mongoose.Schema(
  {
    dateSpent: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1, // no negative or zero
    },
    // In your FinanceExpenseModel.js, add:
    modeOfPayment: {
      type: String,
      enum: ["cash", "card", "bank-transfer", "other"],
      required: true,
    },
    name: {
      type: String,
      required: true, // vendor / employee / payee name
    },
    category: {
      type: String,
      enum: [
        "inventory",
        "salary",
        "utility bills",
        "equipment maintenance",
        "administration costs",
        "rent",
        "sundry",
        "staff amenities",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String, // path or URL
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// 🔥 Custom validation: if category is "other", description must be provided
financeExpenseSchema.pre("validate", function (next) {
  if (this.category === "other" && (!this.description || this.description.trim() === "")) {
    this.invalidate("description", "Description is required when category is 'other'");
  }
  next();
});

const FinanceExpense = mongoose.model("FinanceExpense", financeExpenseSchema);

export default FinanceExpense;
