// src/routes/InventoryRoutes.js
import express from "express";
import * as InventoryController from "../controllers/InventoryController.js";

const router = express.Router();

router.get("/", InventoryController.getAllInventory);
router.post("/", InventoryController.addInventory);
router.get("/:id", InventoryController.getById);
router.put("/:id", InventoryController.updateInventory);
router.delete("/:id", InventoryController.deleteInventory);

export default router;