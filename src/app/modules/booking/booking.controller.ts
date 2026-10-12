import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { bookingService } from "./booking.service";

const toggleAutoAccept = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.toggleBookingAutoAccept(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
  });
});

const createBookingInDB = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.createBookingInDB(req.user.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
  });
});
const userBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.getUserWiseBookingsFromDB(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User bookings retrieved successfully",
    data: result,
  });
});
const providerBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.getProviderWiseBookingsFromDB(
    req.user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Provider bookings retrieved successfully",
    data: result,
  });
});
const acceptOrRejectBooking = catchAsync(
  async (req: Request, res: Response) => {
    const { bookingId, isAccepted } = req.body;
    const result = await bookingService.acceptOrRejectBookingInDB(
      bookingId,
      isAccepted,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: result.message,
    });
  },
);
const markCompleted = catchAsync(async (req: Request, res: Response) => {
  await bookingService.markBookigAsCompletedInDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Booking marked as completed successfully",
  });
});
const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  await bookingService.cancelBookingInDB(req.user.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Booking cancelled successfully",
  });
});
const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  await bookingService.deleteBookingInDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Booking deleted successfully",
  });
});
const bookingDetailsForUser = catchAsync(
  async (req: Request, res: Response) => {
    const result = await bookingService.getBookingDetailsForUser(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Booking details retrieved successfully",
      data: result,
    });
  },
);
const bookingDetailsForProvider = catchAsync(
  async (req: Request, res: Response) => {
    const result = await bookingService.getBookingsDetailsForProvider(
      req.params.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Booking details retrieved successfully",
      data: result,
    });
  },
);
const createReview = catchAsync(async (req: Request, res: Response) => {
  await bookingService.createReviewIntoDB(req.user.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Review created successfully",
  });
});
const completedClients = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.getCompletedClientFromDB(
    req.user.id,
    req.query.search as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Completed clients retrieved successfully",
    data: result,
  });
});
const earningsSummary = catchAsync(async (req: Request, res: Response) => {
  const type = req.query.type as "weekly" | "monthly";
  const result = await bookingService.getProviderEarningSummaryFromDB(
    req.user.id,
    type,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Earnings summary retrieved successfully",
    data: result,
  });
});
const earningsTotal = catchAsync(async (req: Request, res: Response) => {
  const type = req.query.type as "monthly" | "daily";
  const result = await bookingService.getProviderEarnings(
    req.user.id,
    type,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Earnings total retrieved successfully",
    data: result,
  });
});

export const bookingController = {
  toggleAutoAccept,
  createBookingInDB,
  deleteBooking,
  userBookings,
  providerBookings,
  acceptOrRejectBooking,
  markCompleted,
  cancelBooking,
  bookingDetailsForUser,
  bookingDetailsForProvider,
  createReview,
  completedClients,
  earningsSummary,
  earningsTotal,
};
