import express from "express";
import upload from "../middleware/multer.js";
import {
  addFinanceExpense,
  getAllFinanceExpenses,
  getFinanceExpenseById,
  updateFinanceExpense,
  deleteFinanceExpense,
  getArchivedExpenses,
} from "../controllers/financeExpenseController.js";

const router = express.Router();

router.post("/", upload.single("image"), addFinanceExpense);
router.get("/", getAllFinanceExpenses);
router.get("/archives", getArchivedExpenses); 
router.get("/:id", getFinanceExpenseById);
router.put("/:id", upload.single("image"), updateFinanceExpense);
router.delete("/:id", deleteFinanceExpense);

export default router;
