import express from "express";
import { createUser } from "../controllers/userController.js";
import { loginUser, logoutUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
