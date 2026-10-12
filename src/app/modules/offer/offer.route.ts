import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { offerController } from "./offer.controller";
import { offerValidation } from "./offer.validation";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.Provider),
  fileUploader.serviceImage,
  parseBodyData,
  validateRequest(offerValidation.createOfferSchema),
  offerController.createOffer,
);
router.get(
  "/provider-wise",
  auth(UserRole.Provider),
  offerController.providerWiseOffers,
);
router.get(
  "/active-offers",
  offerController.allActiveOffers,
);
router.get(
  "/details/:id",
  // auth(UserRole.Provider),
  offerController.offerDetails,
);
router.get(
  "/details-for-admin/:id",
  // auth(UserRole.Provider),
  offerController.offerDetails,
);
router.put(
  "/create",
  auth(),
  fileUploader.serviceImage,
  parseBodyData,
  validateRequest(offerValidation.updateOfferSchema),
  offerController.updateOffer,
);

router.post(
  "/create/by-admin",
  auth(),
  fileUploader.serviceImage,
  parseBodyData,
  validateRequest(offerValidation.createOfferSchema),
  offerController.createOfferByAdmin,
);

export const offerRoutes = router;
