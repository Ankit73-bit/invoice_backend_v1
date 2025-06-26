import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";

const router = express.Router();

router.use(authMiddleware); // all routes require login

router.get("/", getAllClients);
router.get("/:id", getClientById);
router.post("/", createClient);
router.patch("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
