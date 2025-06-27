import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import restrictTo from "../middleware/roleMiddleware.js";
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deactivateCompany,
  reactivateCompany,
} from "../controllers/companyController.js";

const router = express.Router();

router.use(authMiddleware, restrictTo("admin")); // admin-only access

router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.post("/", createCompany);
router.patch("/:id", updateCompany);
router.patch("/:id/deactivate", deactivateCompany);
router.patch("/:id/reactivate", reactivateCompany);

export default router;
