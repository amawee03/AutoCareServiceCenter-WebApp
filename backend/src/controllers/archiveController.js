// controllers/archiveController.js
import FinanceIncomeArchive from "../models/FinanceIncomeArchiveModel.js";

// Get all archived records
export const getArchivedRecords = async (req, res) => {
  try {
    const records = await FinanceIncomeArchive.find().sort({ deletedAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch archives", error: error.message });
  }
};
