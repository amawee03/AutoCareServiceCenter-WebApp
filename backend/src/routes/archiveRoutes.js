import express from "express";
import { getArchivedRecords } from "../controllers/archiveController.js";

const router = express.Router();

router.get("/", getArchivedRecords);

export default router;
