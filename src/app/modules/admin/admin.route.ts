import express from "express";
import { adminController } from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { adminValidation } from "./admin.validation";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/login", adminController.loginAdmin);
router.patch("/change-password", auth(), adminController.changePassword);
router.get("/all", auth(), adminController.getAdmins);
router.get("/single/:id", auth(), adminController.admin);
router.post("/create", auth(), adminController.createAdmin);
router.post(
  "/faq-create",
  validateRequest(adminValidation.faqValiationSchema),
  adminController.createFaq,
);
router.get("/all-faqs", adminController.getFaqs);
router.get("/all-notify", adminController.allNotify);
router.delete("/all-notify", adminController.deleteAllDashNotify);
router.delete("/notify/:id", adminController.deleteDashNotify);
router.get("/all-notify", adminController.allNotify);
router.get("/faq/:id", adminController.getFaq);
router.delete("/faq/:id", adminController.deleteFaq);
router.put("/faq/update", adminController.updateFaq);
router.post(
  "/cancel-reason-create",
  validateRequest(adminValidation.cancelReasonValidationSchema),
  adminController.createReason,
);
router.get("/all-cancel-reasons", adminController.getReasons);
router.get("/feedbacks", adminController.feedbacks);
router.get(
  "/business-completed-bookings/:id",
  adminController.getBusinessCompletedBookings,
);
router.delete("/review/delete/:id", adminController.deleteReview);
router.put("/review/update", adminController.updateReview);
router.get("/cancel-reason/:id", adminController.getReason);
router.delete("/cancel-reason/:id", adminController.deleteReason);
router.put("/cancel-reason/update", adminController.updateReason);
router.post("/send-otp", adminController.sendForgotPasswordOtpDB);
router.post("/verify-otp", adminController.verifyOTP);
router.patch("/reset-password", auth(), adminController.setNewPassword);
router.delete("/delete/:id", auth(), adminController.deleteAdmin);
router.get("/all-businesses", auth(), adminController.allBusiness);
router.get("/all-users", auth(), adminController.allUsers);
router.get("/all-offers", auth(), adminController.allOffers);
router.get("/all-services", auth(), adminController.allServices);
router.get("/profile", auth(), adminController.adminProfile);
router.get("/top-rated-businesses", auth(), adminController.topRatedBusinesses);
router.get(
  "/most-requested-services",
  auth(),
  adminController.mostRequestedServices,
);
router.get("/top-clients", auth(), adminController.topClients);
router.get("/all-bookings", auth(), adminController.allBookings);
router.delete("/user/:id", auth(), adminController.deleteUser);
router.get("/business/:id", auth(), adminController.businessDetails);
router.get("/user-details/:id", auth(), adminController.usersDetails);
router.patch(
  "/business-verify",
  auth(),
  adminController.verifyOrRejectBusiness,
);
router.patch(
  "/block-unblock-user/:id",
  auth(),
  adminController.blockUnblockUser,
);
router.post(
  "/send-notification",
  auth(),
  validateRequest(adminValidation.adminNotificationSchema),
  adminController.sendNotifications,
);
router.get("/all-notifications", auth(), adminController.getAdminNotifications);
router.delete(
  "/notification/:id",
  auth(),
  adminController.deleteAdminNotification,
);

router.post(
  "/create-privacy-policy",
  // auth(),
  adminController.createPrivacyPolicy,
);
router.get("/business-earnings", adminController.topProviderByEarnings);
router.get("/privacy-policy", adminController.getPrivacyPolicy);
router.post(
  "/create-privacy-policy",
  // auth(),
  adminController.createPrivacyPolicy,
);
router.get("/privacy-policy", adminController.getPrivacyPolicy);
router.get("/earnings-summary", adminController.getEarningsSummary);
router.get("/performance-summary", adminController.getPerformanceSummary);
router.get("/dashboard-overview", adminController.getDashboardOverview);
router.get("/business-overview", adminController.getBusinessOverview);
router.get("/user-overview", adminController.getUserOverview);
router.get("/welcome-message", adminController.getWelcomeMessage);
router.post("/welcome-message", adminController.createWelcomeMessage);
router.get("/blocked-users", auth(), adminController.getBlockedUsers);
router.put(
  "/update-profile",
  auth(),
  fileUploader.profileImage,
  parseBodyData,
  adminController.updateAdminProfile,
);
router.put("/accept-reject-offer", auth(), adminController.acceptRejectOffer);
router.delete("/delete-offer/:id", auth(), adminController.deleteOffer);
router.delete("/delete-service/:id", auth(), adminController.deleteService);
router.get("/offer-details/:id", auth(), adminController.getOfferDetails);
router.get("/service-details/:id", auth(), adminController.getServiceDetails);
router.put(
  "/update-business",
  auth(),
  fileUploader.uploadMultiple,
  parseBodyData,
  adminController.updateProvider,
);
router.get(
  "/all-notify-users",
  auth(),
  adminController.allUserss,
);
router.get(
  "/notify-options",
  auth(UserRole.Admin),
  adminController.currentOptions,
);
router.put(
  "/notify-options",
  auth(UserRole.Admin),
  adminController.updateNotifyOptions,
);
router.get(
  "/formula",
  // auth(UserRole.Admin),
  adminController.currentFormula,
);
router.put(
  "/formula",
  // auth(UserRole.Admin),
  adminController.updateFormula,
);

export const adminRoutes = router;
