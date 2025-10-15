import express from "express";
import { getInventorySummary } from "../controllers/InvenDashboardController.js";

const router = express.Router();

// Summary Route
router.get("/summary", getInventorySummary);

export default router;
