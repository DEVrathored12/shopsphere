import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import {
  createRequest,
  getRequestsForOwner,
  getMyRequests,
  respondToRequest,
  sendMessage,
  getMessages,
} from "../controllers/request.controller.js";

const router = Router();

router.post("/", protect, createRequest);
router.get("/owner", protect, authorize("shop_owner"), getRequestsForOwner);
router.get("/customer", protect, getMyRequests);
router.patch("/:id/respond", protect, authorize("shop_owner"), respondToRequest);
router.post("/:id/messages", protect, sendMessage);
router.get("/:id/messages", protect, getMessages);

export default router;
