import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { sendSingleNotification } from "../notifications/notification.services";
import {
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  getDay,
  getMonth,
} from "date-fns";

const createBookingInDB = async (userId: string, payload: any) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (!payload.offerId && !payload.serviceId) {
    throw new ApiError(400, "Either offerId or serviceId must be provided");
  }
  if (payload.offerId && payload.serviceId) {
    throw new ApiError(
      400,
      "Both offerId and serviceId cannot be provided together",
    );
  }

  let offer = null;
  let service = null;

  if (payload.offerId) {
    offer = await prisma.offer.findUniqueOrThrow({
      where: { id: payload.offerId },
    });
  }

  if (payload.serviceId) {
    service = await prisma.service.findUniqueOrThrow({
      where: { id: payload.serviceId },
    });
  }
  const providerId = offer ? offer.providerId : service?.providerId;

  const provider = await prisma.providerProfile.findUniqueOrThrow({
    where: { providerId },
  });

  const business = await prisma.user.findUnique({
    where: { id: providerId, status: "Active" },
  });

  if (!business) {
    throw new ApiError(404, "Business not found or inactive");
  }

  if (offer && offer?.alreadyBooked == offer?.totalAvailableSlots) {
    throw new ApiError(400, "This offer is fully booked");
  }

  const bookingDate = new Date(payload.date);

  if (Number.isNaN(bookingDate.getTime())) {
    throw new ApiError(400, "Invalid booking date");
  }

  if (bookingDate < startOfDay(new Date())) {
    throw new ApiError(400, "Booking date cannot be in the past");
  }

  await prisma.booking.create({
    data: {
      userId,
      providerId: providerId as string,
      date: payload.date,
      price: offer ? offer.servicePrice : (service?.servicePrice as number),
      status: provider.bookingAutoAccept ? "Active" : "Pending",
      offerId: payload.offerId,
      serviceId: payload.serviceId,
      time: payload.time,
    },
  });

  if (offer) {
    await prisma.offer.update({
      where: { id: offer.id },
      data: { alreadyBooked: { increment: 1 } },
    });
  }

  await prisma.dashNotify.create({
    data: {
      title: `New Service Booked`,
      content: `${user.fullName} has booked a new service`,
      additionalDetails: "dsfsfsd",
    },
  });

  try {
    await sendSingleNotification(
      providerId as string,
      `${provider.bookingAutoAccept ? "تم إضافة حجز جديد بنجاح" : "تم استلام حجز جديد، يرجى مراجعته وتأكيده لتثبيت الموعد"}`,
      userId,
      "تم استلام حجز جديد",
    );
  } catch (notificationError) {
    console.error("Notification failed:", notificationError);
  }

  return {
    message: provider.bookingAutoAccept ? "Automatic" : "Pending",
  };
};

const getUserWiseBookingsFromDB = async (userId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      time: true,
      price: true,
      status: true,
      isReviewed: true,
      offer: {
        select: {
          id: true,
          serviceName: true,
          mediaUrl: true,
        },
      },
      service: {
        select: {
          id: true,
          serviceName: true,
          url1: true,
          duration: true,
        },
      },
      provider: {
        select: {
          id: true,
          fullName: true,
          avgRating: true,
          totalReview: true,
          providerProfiles: {
            select: {
              locationLink: true,
            },
          },
        },
      },
    },
  });

  return bookings;
};
const getProviderWiseBookingsFromDB = async (providerId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { providerId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      time: true,
      price: true,
      status: true,
      updatedAt: true,
      provider: {
        select: {
          providerProfiles: {
            select: {
              region: true,
              city: true,
            },
          },
        },
      },
      offer: {
        select: {
          id: true,
          serviceName: true,
          mediaUrl: true,
          location: true,
        },
      },
      service: {
        select: {
          id: true,
          serviceName: true,
          url1: true,
          serviceMode: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
    },
  });

  return bookings;
};

const toggleBookingAutoAccept = async (providerId: string) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { providerId },
  });

  if (!providerProfile) {
    throw new Error("Provider profile not found");
  }

  const currentValue = providerProfile.bookingAutoAccept as boolean;

  await prisma.providerProfile.update({
    where: { id: providerProfile.id },
    data: { bookingAutoAccept: !currentValue },
  });

  return {
    message: `Booking auto-accept has been ${!currentValue ? "enabled" : "disabled"} successfully`,
  };
};

const acceptOrRejectBookingInDB = async (
  bookingId: string,
  isAccepted: boolean,
) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId, status: "Pending" },
  });

  if (isAccepted) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "Active" },
    });

    // try {
    //   await sendSingleNotification(
    //     booking.providerId,
    //     `Provider has accepted your booking request for ${booking.date} at ${booking.time}. It is now confirmed and added to your schedule.`,
    //     booking.userId,
    //     "Booking Accepted!",
    //   );
    // } catch (notificationError) {
    //   console.error("Notification failed:", notificationError);
    // }

    return {
      message: "Booking accepted successfully",
    };
  }

  await prisma.booking.delete({
    where: { id: bookingId },
  });

  try {
    await sendSingleNotification(
      booking.providerId,
      `لقد رفض مقدم الخدمة طلب الحجز الخاص بك في ${booking.date} الساعة ${booking.time}. يمكنك استكشاف خدمات أو مزودين آخرين بسهولة.
      `,
      booking.userId,
      "تم رفض الحجز",
    );
  } catch (notificationError) {
    console.error("Notification failed:", notificationError);
  }

  return {
    message: "Booking rejected and deleted successfully",
  };
};

const markBookigAsCompletedInDB = async (bookingId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId, status: "Active" },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "Completed" },
  });

  await prisma.providerProfile.update({
    where: { providerId: booking.providerId },
    data: { earnings: { increment: booking.price } },
  });

  try {
    await sendSingleNotification(
      booking.userId,
      `
يسعدنا مشاركتك لتقييم تجربتك مع مقدم الخدمة
شكرًا لاستخدامك منصة شعرة"
`,
      booking.providerId,
      "تم إكمال الحجز بنجاح",
    );
  } catch (notificationError) {
    console.error("Notification failed:", notificationError);
  }

  return;
};

const cancelBookingInDB = async (userId: string, payload: any) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: payload.bookingId, status: "Active" },
  });

  await prisma.booking.update({
    where: { id: payload.bookingId },
    data: {
      status: "Cancelled",
      cancelReason: payload.cancelReason,
    },
  });

  let service = null;

  if (booking.serviceId) {
    service = await prisma.service.findUnique({
      where: { id: booking.serviceId },
    });
  }

  if (booking.offerId) {
    service = await prisma.offer.findUnique({
      where: { id: booking.offerId },
    });
  }

  await prisma.dashNotify.create({
    data: {
      title: `Booking Cancelled`,
      content: `${user.fullName} has cancelled a booking. Reason: ${payload.cancelReason}`,
      additionalDetails: "dsfsfsd",
    },
  });

  const modifiedDate = new Date(booking.date).toDateString();

  const time = `\u200E${booking.time}\u200E`;
  const ltr = (text: string) => `\u200E${text}\u200E`;

  try {
    await sendSingleNotification(
      user.role === "Provider" ? booking.userId : booking.providerId,
      `الخدمة: ${service ? service.serviceName : "N/A"}
بتاريخ: ${modifiedDate}
الساعة: ${time}
السبب: ${ltr(payload.cancelReason)}
`,
      booking.userId,
      "تم إلغاء الحجز",
    );
  } catch (notificationError) {
    console.error("Notification failed:", notificationError);
  }

  return;
};

const deleteBookingInDB = async (bookingId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
  });

  if (booking.status == "Completed") {
    await prisma.providerProfile.update({
      where: { providerId: booking.providerId },
      data: { earnings: { decrement: booking.price } },
    });
  }

  await prisma.booking.delete({
    where: { id: bookingId },
  });
  return;
};

const getBookingDetailsForUser = async (bookingId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    select: {
      id: true,
      date: true,
      time: true,
      price: true,
      status: true,
      cancelReason: true,
      provider: {
        select: {
          id: true,
          fullName: true,
          avgRating: true,
          totalReview: true,
          phoneNumber: true,
          profileImage: true,
          providerProfiles: {
            select: {
              salonDescription: true,
              city: true,
            },
          },
        },
      },
      service: {
        select: {
          id: true,
          serviceName: true,
          url1: true,
          description: true,
          duration: true,
        },
      },
      offer: {
        select: {
          id: true,
          servicePrice: true,
          serviceName: true,
          mediaUrl: true,
          serviceCategory: true,
          description: true,
        },
      },
    },
  });

  return booking;
};

const getBookingsDetailsForProvider = async (bookingId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    select: {
      id: true,
      price: true,
      date: true,
      time: true,
      status: true,
      service: {
        select: {
          id: true,
          serviceName: true,
          url1: true,
          serviceMode: true,
          serviceCategory: true,
          duration: true,
        },
      },
      offer: {
        select: {
          id: true,
          servicePrice: true,
          serviceName: true,
          mediaUrl: true,
          serviceCategory: true,
          description: true,
          location: true,
        },
      },
      provider: {
        select: {
          avgRating: true,
          totalReview: true,
          fullName: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          profileImage: true,
        },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });
  return booking;
};

const createReviewIntoDB = async (userId: string, payload: any) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: payload.bookingId, status: "Completed", isReviewed: false },
  });

  const provider = await prisma.user.findUniqueOrThrow({
    where: { id: booking.providerId },
    select: {
      id: true,
      avgRating: true,
      totalReview: true,
    },
  });

  const currentTotalReview = provider.totalReview || 0;
  const currentAvgRating = provider.avgRating || 0;
  const nextTotalReview = currentTotalReview + 1;
  const nextAvgRating = Number(
    (
      (currentAvgRating * currentTotalReview + payload.rating) /
      nextTotalReview
    ).toFixed(2),
  );

  await prisma.$transaction([
    prisma.review.create({
      data: {
        bookingId: payload.bookingId,
        userId,
        providerId: booking.providerId,
        serviceId: booking.serviceId,
        offerId: booking.offerId,
        comment: payload.comment,
        rating: payload.rating,
      },
    }),
    prisma.booking.update({
      where: { id: payload.bookingId },
      data: { isReviewed: true },
    }),
    prisma.user.update({
      where: { id: booking.providerId },
      data: {
        totalReview: nextTotalReview,
        avgRating: nextAvgRating,
      },
    }),
  ]);

  try {
    await sendSingleNotification(
      booking.providerId,
      `
التقييم: ${payload.rating} نجوم
التعليق: ${payload.comment}"`,
      booking.userId,
      "لقد تلقيت تقييمًا على خدمتك",
    );
  } catch (notificationError) {
    console.error("Notification failed:", notificationError);
  }

  return;
};

const getCompletedClientFromDB = async (
  providerId: string,
  search?: string,
) => {
  const completedBookings = await prisma.booking.findMany({
    where: {
      providerId,
      status: "Completed",
      ...(search && {
        OR: [
          {
            service: { serviceName: { contains: search, mode: "insensitive" } },
          },
          { user: { fullName: { contains: search, mode: "insensitive" } } },
        ],
      }),
    },
    select: {
      id: true,
      price: true,
      time: true,
      date: true,
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
      service: {
        select: {
          serviceName: true,
        },
      },
    },
  });

  return completedBookings;
};

const getProviderEarningSummaryFromDB = async (
  providerId: string,
  type: "weekly" | "monthly",
) => {
  const provider = await prisma.providerProfile.findUniqueOrThrow({
    where: { providerId },
  });

  const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let chartData: any[] = [];

  if (type === "weekly") {
    const start = startOfWeek(new Date(), { weekStartsOn: 6 }); // Sat
    const end = endOfWeek(new Date(), { weekStartsOn: 6 }); // Fri

    const weekEarnings = await prisma.booking.findMany({
      where: {
        providerId,
        status: "Completed",
        date: { gte: start, lte: end },
      },
      select: { price: true, date: true },
    });

    const weeklyData = Array(7).fill(0);

    for (const e of weekEarnings) {
      const localDate = new Date(e.date); // ✅ FIXED
      const dayIndex = getDay(localDate); // 0=Sun ... 6=Sat
      const mappedIndex = (dayIndex - 6 + 7) % 7; // shift so Sat=0
      weeklyData[mappedIndex] += e.price;
    }

    chartData = days.map((day, idx) => ({
      day,
      earnings: weeklyData[idx],
    }));
  }

  if (type === "monthly") {
    const start = startOfYear(new Date());
    const end = endOfYear(new Date());

    const monthEarnings = await prisma.booking.findMany({
      where: {
        providerId,
        status: "Completed",
        date: { gte: start, lte: end },
      },
      select: { price: true, date: true },
    });

    const monthlyData = Array(12).fill(0);

    for (const e of monthEarnings) {
      const localDate = new Date(e.date);
      const monthIndex = getMonth(localDate);
      monthlyData[monthIndex] += e.price;
    }

    chartData = months.map((month, idx) => ({
      month,
      earnings: monthlyData[idx],
    }));
  }

  return {
    earnings: provider.earnings,
    chartData,
  };
};

const getProviderEarnings = async (
  providerId: string,
  type?: "monthly" | "daily",
) => {
  const now = new Date();

  const dateFilter =
    type === "monthly"
      ? {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        }
      : type === "daily"
        ? {
            gte: startOfDay(now),
            lte: endOfDay(now),
          }
        : undefined;

  const earning = await prisma.booking.aggregate({
    where: {
      providerId,
      status: "Completed",
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    _sum: { price: true },
  });

  return earning._sum.price || 0;
};

export const bookingService = {
  toggleBookingAutoAccept,
  createBookingInDB,
  getUserWiseBookingsFromDB,
  getProviderWiseBookingsFromDB,
  acceptOrRejectBookingInDB,
  markBookigAsCompletedInDB,
  cancelBookingInDB,
  getBookingDetailsForUser,
  getBookingsDetailsForProvider,
  deleteBookingInDB,
  createReviewIntoDB,
  getCompletedClientFromDB,
  getProviderEarningSummaryFromDB,
  getProviderEarnings,
};
