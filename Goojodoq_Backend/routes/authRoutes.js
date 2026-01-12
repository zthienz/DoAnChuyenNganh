import express from "express";
import { register, login, getUserInfo, getAllUsers, deleteUser, toggleUserStatus } from "../controllers/authController.js";

const router = express.Router();

// Đăng ký
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

// Lấy thông tin người dùng
router.get("/user/:userId", getUserInfo);

// Admin: Lấy tất cả người dùng
router.get("/users", getAllUsers);

// Admin: Xóa người dùng
router.delete("/user/:userId", deleteUser);

// Admin: Khóa/Mở khóa người dùng
router.put("/user/:userId/toggle-status", toggleUserStatus);

export default router;
