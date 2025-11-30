import express from "express";
import {
  createSupportRequest,
  getAllSupportRequests,
  getSupportRequestById,
  updateSupportRequestStatus,
  getSupportRequestsByUser,
  getSupportStats
} from "../controllers/supportController.js";

const router = express.Router();

// Admin routes - IMPORTANT: Specific routes must come before generic ones
router.get("/stats", getSupportStats);
router.get("/user/:userId", getSupportRequestsByUser);
router.get("/:requestId", getSupportRequestById);
router.put("/:requestId/status", updateSupportRequestStatus);

// List all (must come after specific GET routes)
router.get("/", getAllSupportRequests);

// Public routes
router.post("/", createSupportRequest);

export default router;
