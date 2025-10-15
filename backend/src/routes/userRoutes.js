// src/routes/userRoutes.js
import express from "express";
import { deleteUser, getAllUsers, updateUser, createUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;