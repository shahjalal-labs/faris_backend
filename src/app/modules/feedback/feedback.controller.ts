import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { feedbackService } from "./feedback.service";

const feedback = catchAsync(async (req, res) => {
  const { content } = req.body;
  await feedbackService.createFeedbackInDB(req.user.id, content);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Feedback submitted successfully",
  });
});
const onboarding = catchAsync(async (req, res) => {
  await feedbackService.createOnboarding(req);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Onboarding updated successfully",
  });
});
const getOnboarding = catchAsync(async (req, res) => {
  const onboarding = await feedbackService.getOnboarding();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Onboarding retrieved successfully",
    data: onboarding,
  });
});
const deleteFeedback = catchAsync(async (req, res) => {
  await feedbackService.deleteFeedback(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Feedback deleted successfully",
  });
});

export const feedbackController = {
  feedback,
  onboarding,
  getOnboarding,
  deleteFeedback,

};
