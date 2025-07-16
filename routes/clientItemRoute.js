import {
  createClientItem,
  deleteClientItem,
  getAllClientItems,
  getClientItems,
  updateClientItem,
} from "../controllers/clientItemController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.use(authMiddleware); // all routes require login

// Routes
router.get("/all", getAllClientItems);
router.get("/client/:clientId", getClientItems);
router.post("/", createClientItem);
router.patch("/:id", updateClientItem);
router.delete("/:id", deleteClientItem);

export default router;
