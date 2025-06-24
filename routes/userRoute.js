import express from "express";
import {
  getAllUsers,
  getUserById,
  createUserByAdmin,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import restrictTo from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, restrictTo("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUserByAdmin);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
