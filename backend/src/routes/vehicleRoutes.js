import express from "express";
import { createVehicle, deleteVehicle, getUserVehicles, updateVehicle, getVehicleById } from "../controllers/vehicleController.js";
import { requireAuth } from "../middleware/authz.js";

const router = express.Router();

// All vehicle routes require authentication
router.use(requireAuth);

router.get("/", getUserVehicles);        // GET /api/vehicles → User vehicles
router.get("/:id", getVehicleById);      // GET /api/vehicles/:id → Single owned vehicle
router.post("/", createVehicle);        // POST /api/vehicles
router.put("/:id", updateVehicle);      // PUT /api/vehicles/:id
router.delete("/:id", deleteVehicle);   // DELETE /api/vehicles/:id

export default router;