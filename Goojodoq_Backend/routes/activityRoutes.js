import express from "express";
import { getRecentActivities, getActivitiesByType } from "../controllers/activityController.js";

const router = express.Router();

// Lấy hoạt động gần đây
router.get("/recent", getRecentActivities);

// Lấy hoạt động theo loại
router.get("/type/:type", getActivitiesByType);

export default router;