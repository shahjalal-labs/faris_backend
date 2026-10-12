import express from "express";
import { authController } from "./auth.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";

const router = express.Router();

router.post("/send-otp", authController.sendForgotPasswordOtpDB);
router.post("/verify-otp", authController.verifyOTP);
router.patch("/reset-password", auth(), authController.setNewPassword);
router.post(
  "/update/user-location",
  auth(),
  validateRequest(authValidation.updateLocationValidationSchema),
  authController.updateUserLocation,
);
router.post(
  "/setup-provider-business",
  auth(UserRole.Provider),
  fileUploader.uploadMultiple,
  parseBodyData,
  validateRequest(authValidation.providerProfileSchema),
  authController.setupProviderBusiness,
);
router.get(
  "/business-info",
  auth(UserRole.Provider),
  authController.getBusiness,

);
router.put(
  "/setup-provider-business",
  auth(UserRole.Provider),
  fileUploader.uploadMultiple,
  parseBodyData,
  validateRequest(authValidation.providerProfileUpdateSchema),
  authController.updateProviderBusiness,
);
router.put(
  "/business-location",
  auth(UserRole.Provider), 
  authController.updateBusinessLocation,
);
router.get(
  "/business-location",
  auth(UserRole.Provider), 
  authController.getBusinessLocation,
);
router.patch(
  "/logout",
  auth(), 
  authController.logout
);

export const authRoutes = router;
