import express from "express";
import {
  createInvoice,
  getAllInvoices,
  getInvoices,
} from "../controllers/invoiceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import restrictTo from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/all", authMiddleware, restrictTo("admin"), getAllInvoices);

export default router;
