import express from "express";
import { notificationController } from "./notification.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", auth(), notificationController.getNotifications);
router.get(
  "/:id",
  auth(),
  notificationController.getSingleNotificationById
);
router.patch(
  "/mark-all-read",
  auth(),
  notificationController.markAllNotificationsAsRead
);
router.delete(
  "/:id",
  auth(),
  notificationController.deleteNotification
);

export const notificationsRoute = router;
