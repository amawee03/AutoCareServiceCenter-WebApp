import FinanceExpense from "../models/FinanceExpenseModel.js";
import FinanceExpenseArchive from "../models/FinanceExpenseArchiveModel.js";

export const addFinanceExpense = async (req, res) => {
  try {
    const { date, dateSpent, amount, name, category, description, modeOfPayment } = req.body;

    const newExpense = new FinanceExpense({
      dateSpent: dateSpent || date,
      amount,
      name,
      category,
      description,
      modeOfPayment,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error("Error saving expense:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Get all expenses
export const getAllFinanceExpenses = async (req, res) => {
  try {
    const expenses = await FinanceExpense.find().sort({ dateSpent: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single expense
export const getFinanceExpenseById = async (req, res) => {
  try {
    const expense = await FinanceExpense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update expense
export const updateFinanceExpense = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.image = `/uploads/${req.file.filename}`;

    const updatedExpense = await FinanceExpense.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedExpense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete (Archive instead of remove)
export const deleteFinanceExpense = async (req, res) => {
  try {
    const { deleteReason, deletePin } = req.body;

    if (!deleteReason?.trim()) {
      return res.status(400).json({ message: "Delete reason is required" });
    }
    if (!deletePin?.trim()) {
      return res.status(400).json({ message: "Delete PIN is required" });
    }
    if (deletePin !== process.env.DELETE_PIN) {
      return res.status(403).json({ message: "Invalid delete PIN" });
    }

    const expense = await FinanceExpense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const archived = new FinanceExpenseArchive({
      ...expense.toObject(),
      originalId: expense._id,
      deleteReason,
      deletedAt: new Date(),
    });

    await archived.save();
    await FinanceExpense.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Expense archived successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get archived expenses
export const getArchivedExpenses = async (req, res) => {
  try {
    const archives = await FinanceExpenseArchive.find().sort({ deletedAt: -1 });
    res.status(200).json(archives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
