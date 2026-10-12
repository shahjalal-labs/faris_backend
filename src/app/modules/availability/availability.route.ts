import express from "express";
import auth from "../../middlewares/auth";
import { availabilityController } from "./availability.controller";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/create",
  auth(UserRole.Provider),
  availabilityController.createAvailability
);
router.get("/", availabilityController.availabilityForDay);
router.get("/provider-slots", availabilityController.getExpertDayWiseSlots);
router.get(
  "/all-slots",
  auth(UserRole.Provider),
  availabilityController.expertAllSlots
);
router.post("/create-slot",  auth(UserRole.Provider), availabilityController.addNewSlot);
router.put("/update-slot", availabilityController.updateSlot);
router.delete("/slot/:id", availabilityController.deleteSlot);

export const availabilityRoutes = router;
