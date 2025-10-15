// src/routes/PurchaseOrderRoutes.js
import express from "express";
import * as PurchaseOrderController from "../controllers/PurchaseOrderController.js";

const router = express.Router();

router.get("/", PurchaseOrderController.getAllPurchaseOrders);
router.post("/", PurchaseOrderController.addPurchaseOrder);
router.get("/:id", PurchaseOrderController.getById);
router.put("/:id", PurchaseOrderController.updatePurchaseOrder);
router.delete("/:id", PurchaseOrderController.deletePurchaseOrder);

export default router;