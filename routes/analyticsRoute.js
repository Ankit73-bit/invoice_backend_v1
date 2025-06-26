import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getInvoiceSummary,
  getMonthlyInvoiceStats,
  getStatusSummary,
  getTopClients,
  getYearlySummary,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/summary", authMiddleware, getInvoiceSummary);
router.get("/monthly", authMiddleware, getMonthlyInvoiceStats);
router.get("/top-clients", authMiddleware, getTopClients);
router.get("/status-summary", authMiddleware, getStatusSummary);
router.get("/yearly", authMiddleware, getYearlySummary);

export default router;
