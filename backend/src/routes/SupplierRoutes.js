// src/routes/SupplierRoutes.js
import express from "express";
import * as SupplierController from "../controllers/SupplierController.js";

const router = express.Router();

router.get("/", SupplierController.getAllSuppliers);
router.post("/", SupplierController.addSupplier);
router.get("/:id", SupplierController.getById);
router.put("/:id", SupplierController.updateSupplier);
router.delete("/:id", SupplierController.deleteSupplier);


export default router;