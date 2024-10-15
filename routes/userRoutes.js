import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
  addUser,
  deleteUser,
  getAllUsers,
  myInfoHandler,
  updateMe,
  updatePassword,
  updateUser,
  userInfoHandler,
} from "../controllers/userController.js";

const router = express.Router();

router.use(protect);

router.get("/myInfo", myInfoHandler);
router.patch("/updateMe", updateMe);
router.patch("/updatePassword", updatePassword);

router.use(restrictTo("admin"));

router.get("/", getAllUsers);
router.post("/", addUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id", userInfoHandler);

export default router;
