import mongoose from "mongoose";

const financeExpenseArchiveSchema = new mongoose.Schema(
  {
    originalId: { type: mongoose.Schema.Types.ObjectId, ref: "FinanceExpense" },
    dateSpent: Date,
    amount: Number,
    name: String,
    category: String,
    description: String,
    modeOfPayment: String,
    image: String,
    deleteReason: { type: String, required: true },
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const FinanceExpenseArchive = mongoose.model(
  "FinanceExpenseArchive",
  financeExpenseArchiveSchema
);

export default FinanceExpenseArchive;
