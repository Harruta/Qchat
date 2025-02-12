import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getUsersForSidebar, getAllUsers, sendMessage, getMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/users/all", protectRoute, getAllUsers);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router; 