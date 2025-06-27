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

router.get("/admin/all-users", getAllUsers);
router.get("admin/get-user/:id", getUserById);
router.post("/admin/create-user", createUserByAdmin);
router.patch("/admin/update-user/:id", updateUser);
router.delete("/admin/delete-user/:id", deleteUser);

export default router;
