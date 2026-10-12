import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";

const sendForgotPasswordOtpDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.sendForgotPasswordOtpDB(req.body.email);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `OTP sent successfully`,
      data: result,
    });
  },
);
const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.verifyForgotPasswordOtpCodeDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `OTP verified successfully`,
    data: result,
  });
});
const setNewPassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const newPassword = req.body.newPassword;
  await authService.resetForgotPasswordDB(newPassword, userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Password reset successfully`,
  });
});

const updateUserLocation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  await authService.userLocationUpdateIntoDB(userId, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User location updated successfully",
  });
});
const setupProviderBusiness = catchAsync(
  async (req: Request, res: Response) => {
    await authService.setupProviderBusinessInfoDB(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider business info setup successfully",
    });
  },
);
const getBusiness = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.getBusinessInfoFromDB(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Provider business info retrieved successfully",
    data: result,
  });
});

const updateProviderBusiness = catchAsync(
  async (req: Request, res: Response) => {
    await authService.updateProviderBusinessInfoDB(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider business info updated successfully",
    });
  },
);
const updateBusinessLocation = catchAsync(
  async (req: Request, res: Response) => {
    await authService.updateBusinessLocationInDB(
      req.user.id,
      req.body.location,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider business location updated successfully",
    });
  },
);
const getBusinessLocation = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.getBusinessLocation(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Business location retrieved successfully",
    data: result,
  });
});
const logout = catchAsync(async (req: Request, res: Response) => {
  await authService.logOutFromDB(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logged Out successfully",
  });
});

export const authController = {
  sendForgotPasswordOtpDB,
  verifyOTP,
  setNewPassword,
  updateUserLocation,
  setupProviderBusiness,
  updateProviderBusiness,
  getBusiness,
  updateBusinessLocation,
  getBusinessLocation,
  logout
};
