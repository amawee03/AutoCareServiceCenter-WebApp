import express from "express";
import {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getPackageById,
} from "../controllers/catalogueController.js";
import { upload } from "../middleware/multer.js"; 

const router = express.Router();

router.get("/", getAllPackages);
router.get("/catalogue/download", getAllPackages); 
router.get("/:id", getPackageById);
router.post("/", upload.single("image"), createPackage);
router.put("/:id", upload.single("image"), updatePackage);
router.delete("/:id", deletePackage);

export default router;
