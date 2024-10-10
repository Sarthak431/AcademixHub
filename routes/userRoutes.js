import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
  addUser,
  deleteUser,
  getAllUsers,
  myInfoHandler,
  updateUser,
  userInfoHandler,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", protect, restrictTo("admin"), getAllUsers);
router.post("/", protect, restrictTo("admin"), addUser);
router.patch("/:id", protect, restrictTo("admin"), updateUser);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);
router.get("/my-info", protect, myInfoHandler);
router.get("/:user_id", protect, restrictTo("admin"), userInfoHandler);

export default router;
