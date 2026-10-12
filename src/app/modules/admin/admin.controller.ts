import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { adminService } from "./admin.service";
import sendResponse from "../../../shared/sendResponse";
import {
  BookingStatus,
  PrivacyKey,
  TServiceCategory,
  UserRole,
} from "@prisma/client";

const loginAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.loginAdminIntoDB(
    req.body.email,
    req.body.password,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin logged in successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user.id;
  const { newPassword, oldPassword } = req.body;
  const result = await adminService.changePasswordFromDB(
    adminId,
    newPassword,
    oldPassword,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin password changed successfully",
    data: result,
  });
});
const createAdmin = catchAsync(async (req: Request, res: Response) => {
  await adminService.createNewAdminIntoDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin created successfully",
  });
});
const getAdmins = catchAsync(async (req: Request, res: Response) => {
  const admins = await adminService.getAdminListFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admins retrieved successfully",
    data: admins,
  });
});

const createFaq = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  await adminService.createFaqIntoDB(payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "FAQ created successfully",
  });
});
const getFaqs = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllFaqsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "FAQs retrived successfully",
    data: result,
  });
});
const getFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getSingleFaqFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "FAQ retrived successfully",
    data: result,
  });
});
const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  await adminService.deleteFaqFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "FAQ deleted successfully",
  });
});
const updateFaq = catchAsync(async (req: Request, res: Response) => {
  await adminService.updateFaqIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "FAQ updated successfully",
  });
});
const createReason = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  await adminService.createReasonIntoDB(payload);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Reason created successfully",
  });
});
const getReasons = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllReasonsFromDB(
    req.query.role as UserRole,
  );
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Cancel Reasons retrieved successfully",
    data: result,
  });
});
const getReason = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getSingleReasonFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Reason retrieved successfully",
    data: result,
  });
});
const deleteReason = catchAsync(async (req: Request, res: Response) => {
  await adminService.deleteReasonFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Reason deleted successfully",
  });
});
const adminProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAdminProfileFromDB(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Admin profile retrieved successfully",
    data: result,
  });
});
const updateReason = catchAsync(async (req: Request, res: Response) => {
  await adminService.updateReasonIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Reason updated successfully",
  });
});

const sendForgotPasswordOtpDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.sendForgotPasswordOtpDB(req.body.email);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `OTP sent successfully`,
      data: result,
    });
  },
);
const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.verifyForgotPasswordOtpCodeDB(req.body);

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
  await adminService.resetForgotPasswordDB(newPassword, userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Password reset successfully`,
  });
});
const feedbacks = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getFeedbacksFromDB();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Feedbacks retrieved successfully`,
    data: result,
  });
});
const admin = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getSingleAdminFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Admin retrieved successfully`,
    data: result,
  });
});
const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  await adminService.delteAdminFromDB(req.params.id, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Admin deleted successfully`,
  });
});
const allBusiness = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search as string;
  const city = req.query.city as string;
  const region = req.query.region as string;
  const category = req.query.category as string;
  const isRecent = req.query.isRecent as string;
  const result = await adminService.getAllBusinessFromDB(
    page,
    search,
    city,
    region,
    category as TServiceCategory,
    isRecent,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Businesses retrieved successfully`,
    data: result,
  });
});
const allUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search as string;
  const result = await adminService.getAllUsersFromDB(page, search);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Users retrieved successfully`,
    data: result,
  });
});
const allNotify = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllDashboardNotify();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Notifications retrieved successfully`,
    data: result,
  });
});
const allOffers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search as string;
  const city = req.query.city as string;
  const region = req.query.region as string;
  const category = req.query.category as string;
  const result = await adminService.getAllOffersFromDB(
    page,
    search,
    region,
    city,
    category as TServiceCategory,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Offers retrieved successfully`,
    data: result,
  });
});
const allServices = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search as string;
  const city = req.query.city as string;
  const region = req.query.region as string;
  const category = req.query.category as string;
  const result = await adminService.getAllServicesFromDB(
    page,
    search,
    region,
    city,
    category as TServiceCategory,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Services retrieved successfully`,
    data: result,
  });
});
const topRatedBusinesses = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search as string;
  const isTopRated = req.query.isTopRated as string;
  const result = await adminService.getTopRatedBusinesses(
    page,
    search,
    isTopRated,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Top-rated businesses retrieved successfully`,
    data: result,
  });
});
const mostRequestedServices = catchAsync(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = req.query.search as string;
    const city = req.query.city as string;
    const region = req.query.region as string;
    const category = req.query.category as TServiceCategory;

    const result = await adminService.getMostRequestedServices(
      page,
      limit,
      search,
      city,
      region,
      category,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `Most requested services retrieved successfully`,
      data: result,
    });
  },
);
const topClients = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search as string;

  const result = await adminService.getTopClientsFromDB(page, search);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Top clients retrieved successfully`,
    data: result,
  });
});
const allBookings = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const search = req.query.search as string;
  const region = req.query.region as string;
  const city = req.query.city as string;
  const category = req.query.category as TServiceCategory;
  const status = req.query.status as BookingStatus;

  const result = await adminService.getAllBookingsFromDB(
    page,
    limit,
    search,
    region,
    city,
    category,
    status,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `All bookings retrieved successfully`,
    data: result,
  });
});
const getBlockedUsers = catchAsync(async (req: Request, res: Response) => {
  const role = req.query.role as UserRole;
  const search = req.query.search as string;

  const result = await adminService.getBlockedUserListFromDB(role, search);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Blocked users retrieved successfully`,
    data: result,
  });
});
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await adminService.deleteUserFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `User deleted successfully`,
  });
});
const businessDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getBusinessDetailsFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `Business details retrieved successfully`,
    data: result,
  });
});
const usersDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getUserDetailsFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `User details retrieved successfully`,
    data: result,
  });
});
const verifyOrRejectBusiness = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.verifyOrRejectBusinessFromDB(
      req.body.id,
      req.body.status,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: result.message,
    });
  },
);
const blockUnblockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.blockUnblockUserInDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
  });
});

const createPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  await adminService.createPrivacyPolicy(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Privacy policy updated  successfully",
  });
});

const getPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const key = req.query.key;
  const result = await adminService.getPrivacyPolicy(key as PrivacyKey);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Privacy policy retrieved successfully",
    data: result,
  });
});
const createWelcomeMessage = catchAsync(async (req: Request, res: Response) => {
  await adminService.createWelcomeMessage(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Welcome message updated  successfully",
  });
});

const getWelcomeMessage = catchAsync(async (req: Request, res: Response) => {
  const key = req.query.key;
  const result = await adminService.getWelcomeMessage(key as UserRole);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Welcome message retrieved successfully",
    data: result,
  });
});
const updateAdminProfile = catchAsync(async (req: Request, res: Response) => {
  await adminService.updateAdminProfileInDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin profile updated successfully",
  });
});
const sendNotifications = catchAsync(async (req: Request, res: Response) => {
  await adminService.sendNotificationsToUsers(req.body, req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Notification sent Successfully",
  });
});

const getAdminNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const result = await adminService.getSentNotificationsFromDB(page);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Notifications retrieved Successfully",
      data: result,
    });
  },
);

const deleteAdminNotification = catchAsync(
  async (req: Request, res: Response) => {
    await adminService.deleteSentNotificationFromDB(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Notification deleted Successfully",
    });
  },
);
const topProviderByEarnings = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getTopProvidersByEarnings();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Top providers by earnings retrieved successfully",
      data: result,
    });
  },
);
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.deleteReviewFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Review deleted successfully",
    data: result,
  });
});
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.updateReviewInDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Review updated successfully",
    data: result,
  });
});
const getBusinessCompletedBookings = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getBusinessCompletedBookingsFromDB(
      req.params.id,
    );
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Business completed bookings retrieved successfully",
      data: result,
    });
  },
);
const getEarningsSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getEarningSummaryFromDB(
    req.query.type as "daily" | "weekly" | "monthly" | "yearly",
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Earnings summary retrieved successfully",
    data: result,
  });
});
const getPerformanceSummary = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getPerformanceSummaryFromDB(
      req.query.type as "daily" | "weekly" | "monthly" | "yearly",
    );
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Performance summary retrieved successfully",
      data: result,
    });
  },
);
const getDashboardOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getDashboardOverviewFromDB();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Dashboard overview retrieved successfully",
    data: result,
  });
});
const getBusinessOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getBusinessOverviewFromDB(
    req.query.type as "day" | "week" | "month",
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Business overview retrieved successfully",
    data: result,
  });
});
const getUserOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getUserOverviewFromDB(
    req.query.type as "day" | "week" | "month",
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User overview retrieved successfully",
    data: result,
  });
});
const acceptRejectOffer = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.acceptOrRejectOfferInDB(
    req.body.offerId,
    req.body.isAccepted,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
  });
});
const deleteOffer = catchAsync(async (req: Request, res: Response) => {
  await adminService.deleteOfferFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Offer deleted successfully",
  });
});
const deleteService = catchAsync(async (req: Request, res: Response) => {
  await adminService.deleteServiceFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service deleted successfully",
  });
});
const getOfferDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getOfferDetailsFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Offer details retrieved successfully",
    data: result,
  });
});
const getServiceDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getServiceDetailsFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Service details retrieved successfully",
    data: result,
  });
});
const updateProvider = catchAsync(async (req: Request, res: Response) => {
  await adminService.updateProviderBusinessInfoByAdmin(req);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Business details updated successfully",
  });
});
const allUserss = catchAsync(async (req: Request, res: Response) => {
  const users = await adminService.getAllUsers();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "All users retrieved successfully",
    data: users,
  });
});
const currentOptions = catchAsync(async (req: Request, res: Response) => {
  const notifyOption = await adminService.getCurrentNotifyOptionFromDB();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Current notify options retrieved successfully",
    data: notifyOption,
  });
});
const updateFormula = catchAsync(async (req: Request, res: Response) => {
  await adminService.updateActivationFormula(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Activation formula updated successfully",
  });
});
const currentFormula = catchAsync(async (req: Request, res: Response) => {
  const formula = await adminService.getCurrentFormula();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Activation formula retrieved successfully",
    data: formula,
  });
});
const updateNotifyOptions = catchAsync(async (req: Request, res: Response) => {
  const notifyOption = await adminService.updateNotifyOption(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Notify options updated successfully",
    data: notifyOption,
  });
});
const deleteDashNotify = catchAsync(async (req: Request, res: Response) => {
  await adminService.deleteDashNotifyById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Notification deleted successfully",
  });
});
const deleteAllDashNotify = catchAsync(async (req: Request, res: Response) => {
  await adminService.deleteAllDashNotify();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "All notifications deleted successfully",
  });
});

export const adminController = {
  deleteAllDashNotify,
  deleteDashNotify,
  currentOptions,
  updateNotifyOptions,
  getBusinessCompletedBookings,
  updateProvider,
  deleteService,
  acceptRejectOffer,
  deleteOffer,
  getOfferDetails,
  getServiceDetails,
  topProviderByEarnings,
  getDashboardOverview,
  getBusinessOverview,
  getUserOverview,
  getPerformanceSummary,
  adminProfile,
  sendNotifications,
  getAdminNotifications,
  deleteAdminNotification,
  deleteReview,
  updateReview,
  getBlockedUsers,
  updateFormula,
  currentFormula,
  loginAdmin,
  createFaq,
  getFaqs,
  getFaq,
  deleteFaq,
  updateFaq,
  updateAdminProfile,
  createReason,
  admin,
  deleteAdmin,
  getReasons,
  getReason,
  deleteReason,
  createWelcomeMessage,
  getWelcomeMessage,
  getEarningsSummary,
  sendForgotPasswordOtpDB,
  allBookings,
  verifyOrRejectBusiness,
  updateReason,
  changePassword,
  createAdmin,
  getAdmins,
  verifyOTP,
  topClients,
  allNotify,
  setNewPassword,
  feedbacks,
  allBusiness,
  deleteUser,
  businessDetails,
  blockUnblockUser,
  allUsers,
  usersDetails,
  allOffers,
  allServices,
  topRatedBusinesses,
  mostRequestedServices,
  createPrivacyPolicy,
  getPrivacyPolicy,
  allUserss,
};
