import mongoose from "mongoose";

const financeIncomeArchiveSchema = new mongoose.Schema(
  {
    originalId: { type: mongoose.Schema.Types.ObjectId, ref: "FinanceIncome" },
    dateReceived: Date,
    amount: Number,
    category: String,
    mode: String,
    name: String,
    description: String,
    image: String,
    deleteReason: { type: String, required: true }, // 🔥 reason required
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const FinanceIncomeArchive = mongoose.model("FinanceIncomeArchive", financeIncomeArchiveSchema);
export default FinanceIncomeArchive;
