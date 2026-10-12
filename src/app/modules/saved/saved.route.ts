import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { savedController } from "./saved.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.Provider),
  fileUploader.uploadMultiple,
  parseBodyData,
  savedController.createSavedService,
);
router.put(
  "/",
  auth(UserRole.Provider),
  fileUploader.uploadMultiple,
  parseBodyData,
  savedController.updateSavedService,
);
router.delete(
  "/:id",
  auth(UserRole.Provider), 
  savedController.deleteSavedService,
);
router.get(
  "/",
  auth(UserRole.Provider),  
  savedController.getProviderSavedServices,
);
router.get(
  "/:id",
  auth(UserRole.Provider),  
  savedController.getSavedService,
);

export const savedRoutes = router;
