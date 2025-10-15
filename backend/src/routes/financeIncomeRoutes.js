import express from "express";
import { upload } from "../middleware/multer.js";
import {
  addFinanceIncome,
  getAllFinanceIncomes,
  getFinanceIncomeById,
  updateFinanceIncome,
  deleteFinanceIncome,
} from "../controllers/financeIncomeController.js";

import { getArchivedIncome } from "../controllers/financeIncomeController.js"; 

const router = express.Router();

router.post("/", upload.single("image"), addFinanceIncome);
router.get("/", getAllFinanceIncomes);

router.get("/archives", getArchivedIncome);

router.get("/:id", getFinanceIncomeById);
router.put("/:id", upload.single("image"), updateFinanceIncome);
router.delete("/:id", deleteFinanceIncome);




export default router;
