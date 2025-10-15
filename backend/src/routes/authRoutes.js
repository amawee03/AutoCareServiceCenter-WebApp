import express from "express";
import { signup, login, getProfile, logout, updateProfile, deleteOwnAccount } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.delete("/profile", deleteOwnAccount);
router.post("/logout", logout);

export default router;