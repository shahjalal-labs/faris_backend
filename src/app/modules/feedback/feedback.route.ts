import express from "express";
import auth from "../../middlewares/auth";
import { feedbackController } from "./feedback.controller";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";

const router = express.Router();

router.post("/create", auth(), feedbackController.feedback);
router.post(
  "/onboarding",
  fileUploader.profileImage,
  parseBodyData,
  feedbackController.onboarding,
);
router.get("/onboarding", feedbackController.getOnboarding);
router.delete("/:id", feedbackController.deleteFeedback);

export const feedbackRoute = router;
