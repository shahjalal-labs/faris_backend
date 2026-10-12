import express from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { availabilityRoutes } from "../modules/availability/availability.route";
import { serviceRoutes } from "../modules/service/service.route";
import { offerRoutes } from "../modules/offer/offer.route";
import { bookingRoutes } from "../modules/booking/booking.route";
import { notificationsRoute } from "../modules/notifications/notification.route";
import { messageRoute } from "../modules/message/message.routes";
import { feedbackRoute } from "../modules/feedback/feedback.route";
import { adminRoutes } from "../modules/admin/admin.route";
import { savedRoutes } from "../modules/saved/saved.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/message",
    route: messageRoute,
  },
  {
    path: "/availability",
    route: availabilityRoutes,
  },
  {
    path: "/offer",
    route: offerRoutes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
  {
    path: "/saved-service",
    route: savedRoutes,
  },
  {
    path: "/feedback",
    route: feedbackRoute,
  },
  {
    path: "/service",
    route: serviceRoutes,
  },
  {
    path: "/booking",
    route: bookingRoutes,
  },
  {
    path: "/notification",
    route: notificationsRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
