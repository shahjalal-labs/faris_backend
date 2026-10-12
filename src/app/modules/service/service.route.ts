import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { serviceController } from "./service.controller";
import { serviceValidation } from "./service.validation";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.Provider),
  fileUploader.uploadMultiple,
  parseBodyData,
  validateRequest(serviceValidation.createServiceValidationSchema),
  serviceController.createService,
);
router.get(
  "/provider-wise",
  auth(UserRole.Provider),
  serviceController.providerServices,
);

router.get(
  "/all",  
  serviceController.getAllServicesGuestMode,
);
router.get(
  "/all-auth",  
  auth(),
  serviceController.getAllServices,
);
router.get(
  "/single/:id",  
  serviceController.singleService,
);
router.get(
  "/details/:id",
  auth(),
  serviceController.serviceDetails
);
router.put(
  "/update",
  auth(),
  fileUploader.uploadMultiple,
  parseBodyData,
  validateRequest(serviceValidation.updateServiceValidationSchema),
  serviceController.updateService
);
router.patch(
  "/toggle-active-deactive/:id",
  auth(UserRole.Provider),
  serviceController.toggleActiveDeactiveService
);
router.delete(
  "/delete/:id",
  auth(UserRole.Provider),
  serviceController.deleteService
);
router.post(
  "/toggle-favorite/:id",
  auth(UserRole.User),
  serviceController.toggleFavoriteService
);
router.get(
  "/get-favorite-services",
  auth(UserRole.User),
  serviceController.getFavouriteServices
);

router.post(
  "/create/by-admin",
  auth(),
  fileUploader.uploadMultiple,
  parseBodyData,
  validateRequest(serviceValidation.createServiceValidationSchema),
  serviceController.createServiceByAdmin,
);

export const serviceRoutes = router;
