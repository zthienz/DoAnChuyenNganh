import express from "express";
import { register, login, getUserInfo } from "../controllers/authController.js";

const router = express.Router();

// Đăng ký
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

// Lấy thông tin người dùng
router.get("/user/:userId", getUserInfo);

export default router;
