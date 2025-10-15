import FinanceIncome from "../models/FinanceIncomeModel.js";
import FinanceIncomeArchive from "../models/FinanceIncomeArchiveModel.js";

// ✅ Create a new finance income
export const addFinanceIncome = async (req, res) => {
  try {
    const { dateReceived, amount, category, mode, name, description } = req.body;

    const newIncome = new FinanceIncome({
      dateReceived,
      amount,
      category,
      mode,
      name,
      description,
      // ✅ Use backticks for template literals
      image: req.file ? `/uploads/${req.file.filename}` : null, 
    });

    const savedIncome = await newIncome.save();
    res.status(201).json(savedIncome);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Get all finance incomes
export const getAllFinanceIncomes = async (req, res) => {
  try {
    const incomes = await FinanceIncome.find();
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get a single finance income by ID
export const getFinanceIncomeById = async (req, res) => {
  try {
    const income = await FinanceIncome.findById(req.params.id);
    if (!income) return res.status(404).json({ message: "Income not found" });
    res.status(200).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update a finance income by ID
export const updateFinanceIncome = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      // ✅ Use backticks here as well
      updates.image = `/uploads/${req.file.filename}`;
    }

    const updatedIncome = await FinanceIncome.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedIncome) return res.status(404).json({ message: "Income not found" });
    res.status(200).json(updatedIncome);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete a finance income by ID
export const deleteFinanceIncome = async (req, res) => {
  try {
    const { deleteReason, deletePin } = req.body;

    // 🔹 1. Check PIN first
    if (!deletePin || deletePin.trim() === "") {
      return res.status(400).json({ message: "Delete PIN is required" });
    }
    if (deletePin !== process.env.DELETE_PIN) {
      return res.status(403).json({ message: "Invalid PIN" });
    }

    // 🔹 2. Then check reason
    if (!deleteReason || deleteReason.trim() === "") {
      return res.status(400).json({ message: "Delete reason is required" });
    }

    const income = await FinanceIncome.findById(req.params.id);
    if (!income) return res.status(404).json({ message: "Income not found" });

    // Move to archive with reason (✅ pin is not saved anymore)
    const archived = new FinanceIncomeArchive({
      ...income.toObject(),
      deletedAt: new Date(),
      deleteReason,
    });
    await archived.save();

    await FinanceIncome.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Record archived successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Get archived income
export const getArchivedIncome = async (req, res) => {
  try {
    const archives = await FinanceIncomeArchive.find().sort({ deletedAt: -1 });
    res.status(200).json(archives);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch archived income", error: error.message });
  }
};


