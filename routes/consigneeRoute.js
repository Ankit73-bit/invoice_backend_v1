import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllConsignees,
  getConsigneeById,
  createConsignee,
  updateConsignee,
  deleteConsignee,
} from "../controllers/consigneeController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAllConsignees);
router.get("/:id", getConsigneeById);
router.post("/", createConsignee);
router.patch("/:id", updateConsignee);
router.delete("/:id", deleteConsignee);

export default router;
