import express from "express";
import { createUser } from "../controllers/userController.js";
import { loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);

export default router;
