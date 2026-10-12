import express from "express";
import { userController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/create-account",
  validateRequest(userValidation.userRegisterValidationSchema),
  userController.createPendingUser,
);
router.post(
  "/verify-signup-otp",
  validateRequest(userValidation.userSignInValidationSchema),
  userController.verifySignupOtp,
);
router.post("/login/phone-number", userController.sendLoginOTP);
router.post("/verify-login-otp", userController.verifyLoginOtp);
router.post(
  "/login/email",
  validateRequest(userValidation.userLoginValidationSchema),
  userController.loginUsingEmailAndPassword,
);
router.get("/profile", auth(), userController.getprofile);
router.get(
  "/provider/overview",
  auth(UserRole.Provider),
  userController.getProfileOverview,
);
router.put(
  "/update-profile",
  auth(),
  fileUploader.profileImage,
  parseBodyData,
  userController.updateProfile,
);
router.get(
  "/provider/overview",
  auth(UserRole.Provider),
  userController.getProfileOverview,
);
router.get("/business", userController.allBusiness);
router.get(
  "/business-details/:id",
  auth(UserRole.User),
  userController.businessDetails,
);
router.get(
  "/business-details/guest/:id",
  userController.businessDetailsForGuest,
);

router.delete("/delete-account", auth(), validateRequest(userValidation.deleteAccountValidationSchema), userController.deleteAccount);

export const userRoutes = router;
