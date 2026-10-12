import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { userService } from "../user/user.services";
import sendResponse from "../../../shared/sendResponse";
import { TServiceCategory, TServiceType } from "@prisma/client";

const createPendingUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createPendingUserInDB(req.body);

  sendResponse(res, {
    success: result.success,
    statusCode: result.statusCode,
    message: `${result.message}`,
  });
});
const verifySignupOtp = catchAsync(async (req: Request, res: Response) => {
  const { phoneNumber, otp } = req.body;
  const result = await userService.verifySignupOtpFromDB(phoneNumber, otp);

  sendResponse(res, {
    success: result.success,
    statusCode: 200,
    message: `${result.message}`,
    data: result,
  });
});
const sendLoginOTP = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.sendLoginOtpToPhone(req.body);

  sendResponse(res, {
    success: result.success,
    statusCode: result.statusCode,
    message: `${result.message}`,
  });
});
const verifyLoginOtp = catchAsync(async (req: Request, res: Response) => {
  const { phoneNumber, otp, fcmToken } = req.body;
  const result = await userService.verifyLoginOtpFromDB(
    phoneNumber,
    otp,
    fcmToken,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Otp Verified successfully`,
    data: result,
  });
});

const loginUsingEmailAndPassword = catchAsync(
  async (req: Request, res: Response) => {
    const result = await userService.loginUsingEmailAndPassword(req.body);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `User loggedin successfully`,
      data: result,
    });
  },
);

const getprofile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUserProfileFromDB(req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `User profile retrieved successfully`,
    data: result,
  });
});
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  await userService.updateUserProfileInDB(req);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `User profile updated successfully`,
  });
});
const getProfileOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getProfileOverviewData(req.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Provider home overview retrieved successfully`,
    data: result,
  });
});

const allBusiness = catchAsync(async (req: Request, res: Response) => {
  const search = req.query.search as string;
  const city = req.query.city as string;
  const region = req.query.region as string;
  const category = req.query.category as string;
  const type = req.query.type as string;
  const result = await userService.getAllBusinessFromDB(
    search,
    city,
    region,
    category as TServiceCategory,
    type as TServiceType,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Businesses retrieved successfully`,
    data: result,
  });
});
const businessDetails = catchAsync(async (req: Request, res: Response) => {
  const businessId = req.params.id as string;
  const result = await userService.getSingleBusinessFromDB(businessId, req.user?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Businesse retrieved successfully`,
    data: result,
  });
});
const businessDetailsForGuest = catchAsync(async (req: Request, res: Response) => {
  const businessId = req.params.id as string;
  const result = await userService.getSingleBusinessFromDBForGuest(businessId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Businesse retrieved successfully`,
    data: result,
  });
});
const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  await userService.deleteAccountFromDB(userId, req.body.password);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Account deleted successfully`,
  });
});

export const userController = {
  createPendingUser,
  verifySignupOtp,
  sendLoginOTP,
  verifyLoginOtp,
  loginUsingEmailAndPassword,
  getprofile,
  updateProfile,
  getProfileOverview,
  allBusiness,
  businessDetails,
  businessDetailsForGuest,
  deleteAccount,
};
