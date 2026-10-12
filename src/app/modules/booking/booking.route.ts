import express from "express";
import auth from "../../middlewares/auth";
import { bookingController } from "./booking.controller";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { bookingValidation } from "./booking.validation";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.User),
  bookingController.createBookingInDB,
);
router.get("/user-wise", auth(UserRole.User), bookingController.userBookings);
router.get(
  "/provider-wise",
  auth(UserRole.Provider),
  bookingController.providerBookings,
);
router.put(
  "/accept-or-reject",
  auth(),
  validateRequest(bookingValidation.acceptRejectValidationSchema),
  bookingController.acceptOrRejectBooking,
);
router.patch(
  "/mark-completed/:id",
  auth(UserRole.Provider),
  bookingController.markCompleted,
);
router.put(
  "/cancel",
  auth(),
  validateRequest(bookingValidation.cancelValidationSchema),
  bookingController.cancelBooking,
);
router.delete(
  "/delete/:id",
  auth(),
  bookingController.deleteBooking,
);
router.patch(
  "/toggle-auto-accept",
  auth(UserRole.Provider),
  bookingController.toggleAutoAccept,
);
router.get(
  "/details-user/:id",
  auth(UserRole.User),
  bookingController.bookingDetailsForUser,
);
router.get(
  "/details-provider/:id",
  auth(UserRole.Provider),
  bookingController.bookingDetailsForProvider,
);
router.post(
  "/create-review",
  auth(UserRole.User),
  validateRequest(bookingValidation.reviewValidationSchema),
  bookingController.createReview,
);
router.get(
  "/completed-clients",
  auth(UserRole.Provider),
  bookingController.completedClients,
);
router.get(
  "/provider-earnings-summary",
  auth(UserRole.Provider),
  bookingController.earningsSummary,
);
router.get(
  "/provider-earnings-total",
  auth(UserRole.Provider),
  bookingController.earningsTotal,
);

export const bookingRoutes = router;
