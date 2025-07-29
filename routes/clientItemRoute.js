import {
  createClientItem,
  deleteClientItem,
  getAllClientItems,
  getClientItems,
  updateClientItem,
  getClientItemCategories,
  getAllCategories,
  getClientItemsByCategory,
} from "../controllers/clientItemController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.use(authMiddleware); // all routes require login

// Routes
router.get("/all", getAllClientItems);
router.get("/categories", getAllCategories); // Get all categories for company
router.get("/client/:clientId", getClientItems);
router.get("/client/:clientId/categories", getClientItemCategories); // Get categories for specific client
router.get("/client/:clientId/grouped", getClientItemsByCategory); // Get items grouped by category
router.post("/", createClientItem);
router.patch("/:id", updateClientItem);
router.delete("/:id", deleteClientItem);

export default router;
