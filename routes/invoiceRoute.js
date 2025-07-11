import express from "express";
import {
  createInvoice,
  getInvoices,
  getAllInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  getNextInvoiceNumber,
} from "../controllers/invoiceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import restrictTo from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(authMiddleware, getInvoices)
  .post(authMiddleware, createInvoice);

router.route("/admin").get(authMiddleware, restrictTo("admin"), getAllInvoices);
router.get("/next-invoice-number", authMiddleware, getNextInvoiceNumber);
router
  .route("/:id")
  .get(authMiddleware, getInvoice)
  .patch(authMiddleware, updateInvoice)
  .delete(authMiddleware, deleteInvoice);

export default router;
