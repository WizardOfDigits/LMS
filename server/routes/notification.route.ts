import express from "express";
import {
  getNotifications,
  updateNotificationStatus,
} from "../controllers/notification.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const notification = express.Router();

// get all notification (admin)
notification.get(
  "/get-all-notifications",
  isAuthenticated,
  authorizeRoles("admin"),
  getNotifications,
);

// update notification status (admin)
notification.put(
  "/updateNotificationStatus/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  updateNotificationStatus,
);
export default notification;
