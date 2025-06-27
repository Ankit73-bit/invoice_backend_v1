import express from "express";
import { createUser } from "../controllers/userController.js";
import { loginUser, logoutUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.delete("/logout/:id", logoutUser);

export default router;
