import {
  AdminNotifications,
  BookingStatus,
  CancelReason,
  Faq,
  Prisma,
  PrivacyKey,
  TServiceCategory,
  UserRole,
} from "@prisma/client";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import generateOTP from "../../../helpers/generateOtp";
import { Request } from "express";
import { uploadInSpace } from "../../../shared/UploadHelper";
import {
  sendNotifications,
  sendSingleNotification,
} from "../notifications/notification.services";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  getDay,
  getMonth,
} from "date-fns";

const loginAdminIntoDB = async (email: string, password: string) => {
  const admin = await prisma.admin.findFirst({
    where: {
      email,
    },
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    admin?.password as string,
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: admin.id,
      email: admin.email,
      role: "Admin",
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );
  return accessToken;
};

const changePasswordFromDB = async (
  adminId: string,
  newPassword: string,
  oldPassword: string,
) => {
  const existingAdmin = await prisma.admin.findUnique({
    where: { id: adminId },
  });

  if (
    !existingAdmin ||
    !(await bcrypt.compare(oldPassword, existingAdmin.password))
  ) {
    throw new Error("Invalid old password");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.jwt.gen_salt),
  );

  await prisma.admin.update({
    where: { id: adminId },
    data: { password: hashedPassword },
  });

  return;
};

const createNewAdminIntoDB = async (payload: any) => {
  const existingAdmin = await prisma.admin.findFirst({
    where: { email: payload.email },
  });
  if (existingAdmin) {
    throw new ApiError(400, "An admin already exists. Cannot create another.");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.jwt.gen_salt),
  );

  await prisma.admin.create({
    data: {
      adminName: payload.adminName,
      email: payload.email,
      password: hashedPassword,
      viewing: payload.viewing,
      editing: payload.editing,
      aic: payload.aic,
      bbm: payload.bbm,
      bm: payload.bm,
      cm: payload.cm,
      cr: payload.cr,
      dashboard: payload.dashboard,
      earnings: payload.earnings,
      in: payload.in,
      sm: payload.sm,
      vo: payload.vo,
    },
  });

  return;
};

const getSingleAdminFromDB = async (id: string) => {
  const admin = await prisma.admin.findUniqueOrThrow({
    where: { id },
  });

  return admin;
};

const getAdminListFromDB = async () => {
  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      adminName: true,
      email: true,
      profileImage: true,
    },
  });
  return admins;
};

const getAdminProfileFromDB = async (id: string) => {
  const admin = await prisma.admin.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      adminName: true,
      email: true,
      profileImage: true,
      city: true,
      region: true,
      bio: true,
      aic: true,
      bbm: true,
      bm: true,
      cm: true,
      cr: true,
      sm: true,
      vo: true,
      viewing: true,
      editing: true,
      in: true,
      earnings: true,
    },
  });

  return admin;
};
const sendNotificationsToUsers = async (
  payload: AdminNotifications,
  adminId: string,
) => {
  if (payload.receiver == "SingleUser" && !payload.userId) {
    throw new ApiError(409, "UserId is required");
  }

  const admin = await prisma.admin.findUniqueOrThrow({
    where: { id: adminId },
  });

  await prisma.adminNotifications.create({
    data: {
      content: payload.content,
      receiver: payload.receiver,
      userId: payload.userId,
    },
  });

  let receiver = "";

  if (payload.receiver == "Providers") {
    receiver = "Provider";
  } else if (payload.receiver == "Users") {
    receiver = "User";
  }
  if (payload.receiver == "SingleUser") {
    try {
      await sendSingleNotification(
        payload.userId as string,
        `${payload.content}`,
        admin.id,
        "لديك رسالة جديدة من منصة شعرة",
      );
      return;
    } catch (notificationError) {
      console.error("Notification failed:", notificationError);
      return;
    }
  }

  await sendNotifications(payload.content, "لديك رسالة جديدة من منصة شعرة", receiver);

  return;
};

const createFaqIntoDB = async (payload: Faq) => {
  const existing = await prisma.faq.findFirst({
    where: { question: payload.question.trim() },
  });

  if (existing) {
    throw new ApiError(400, "This question already exists");
  }

  await prisma.faq.create({
    data: {
      question: payload.question,
      answer: payload.answer,
    },
  });
  return;
};

const getAllFaqsFromDB = async () => {
  const faqs = await prisma.faq.findMany({
    select: {
      id: true,
      question: true,
      answer: true,
    },
  });
  return faqs;
};

const getSingleFaqFromDB = async (id: string) => {
  const faq = await prisma.faq.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      answer: true,
      question: true,
    },
  });
  return faq;
};

const deleteFaqFromDB = async (id: string) => {
  await prisma.faq.delete({ where: { id } });
  return;
};

const updateFaqIntoDB = async (payload: any) => {
  const existingFaq = await prisma.faq.findUniqueOrThrow({
    where: { id: payload.faqId },
  });
  const newQuestion = payload.question || existingFaq.question;

  const duplicate = await prisma.faq.findFirst({
    where: {
      question: newQuestion,
      NOT: { id: payload.faqId },
    },
  });

  if (duplicate) {
    throw new ApiError(400, "Another FAQ already uses this question");
  }

  await prisma.faq.update({
    where: { id: payload.faqId },
    data: {
      question: newQuestion,
      answer: payload.answer || existingFaq.answer,
    },
  });

  return;
};
const createReasonIntoDB = async (payload: CancelReason) => {
  const existing = await prisma.cancelReason.findFirst({
    where: { reason: payload.reason.trim() },
  });

  if (existing) {
    throw new ApiError(400, "This reason already exists");
  }

  await prisma.cancelReason.create({
    data: {
      reason: payload.reason,
      role: payload.role,
    },
  });
  return;
};

const getAllReasonsFromDB = async (role?: UserRole) => {
  const reasons = await prisma.cancelReason.findMany({
    where: {
      role: role ? role : undefined,
    },
    select: {
      id: true,
      reason: true,
    },
  });
  return reasons;
};

const getSingleReasonFromDB = async (id: string) => {
  const reason = await prisma.cancelReason.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      reason: true,
    },
  });
  return reason;
};

const deleteReasonFromDB = async (id: string) => {
  await prisma.cancelReason.delete({ where: { id } });
  return;
};

const updateReasonIntoDB = async (payload: any) => {
  const existingReason = await prisma.cancelReason.findUniqueOrThrow({
    where: { id: payload.reasonId },
  });
  const newReason = payload.reason || existingReason.reason;

  const duplicate = await prisma.cancelReason.findFirst({
    where: {
      reason: newReason,
      NOT: { id: payload.reasonId },
    },
  });

  if (duplicate) {
    throw new ApiError(400, "Another reason already uses this question");
  }

  await prisma.cancelReason.update({
    where: { id: payload.reasonId },
    data: {
      reason: newReason,
    },
  });

  return;
};
const sendForgotPasswordOtpDB = async (email: string) => {
  const existringUser = await prisma.admin.findFirst({
    where: {
      email: email,
    },
  });
  if (!existringUser) {
    throw new ApiError(404, "Admin not found");
  }
  // Generate OTP and expiry time
  const otp = generateOTP(); // 4-digit OTP
  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
  const subject = "Your Password Reset OTP";
  const html = `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Password Reset Request</h2>
    <p>Hi <b>${existringUser.adminName}</b>,</p>
    <p>Your OTP for password reset is:</p>
    <h1 style="color: #007BFF;">${otp}</h1>
    <p>This OTP is valid for <b>5 minutes</b>. If you did not request this, please ignore this email.</p>
    <p>Thanks, <br>The Support Team</p>
  </div>
`;
  // await sendEmail(email, subject, html);
  await prisma.otp.upsert({
    where: {
      email: email,
    },
    update: { otp: otp, expiresAt: new Date(expiresAt) },
    create: { email: email, otp: otp, expiresAt: new Date(expiresAt) },
  });

  return otp;
};
const verifyForgotPasswordOtpCodeDB = async (payload: any) => {
  const { email, otp } = payload;

  if (!email && !otp) {
    throw new ApiError(400, "Email and OTP are required.");
  }

  const user = await prisma.admin.findFirst({ where: { email: email } });
  if (!user) {
    throw new ApiError(404, "Admin not found");
  }

  const verifyData = await prisma.otp.findUnique({
    where: {
      email: email,
    },
  });

  if (!verifyData) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  const { otp: savedOtp, expiresAt } = verifyData;

  if (otp !== savedOtp) {
    throw new ApiError(401, "Invalid OTP.");
  }

  if (Date.now() > expiresAt.getTime()) {
    await prisma.otp.delete({
      where: {
        email: email,
      },
    }); // OTP has expired
    throw new ApiError(410, "OTP has expired. Please request a new OTP.");
  }

  // OTP is valid
  await prisma.otp.delete({
    where: {
      email: email,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    { id: user.id, email },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return { accessToken: accessToken };
};

// reset password
const resetForgotPasswordDB = async (newPassword: string, userId: string) => {
  const existingUser = await prisma.admin.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new ApiError(404, "Admin not found");
  }
  const email = existingUser.email as string;
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.jwt.gen_salt),
  );

  await prisma.admin.updateMany({
    where: {
      email: email,
    },
    data: {
      password: hashedPassword,
    },
  });

  return;
};

const getFeedbacksFromDB = async () => {
  const feedbacks = await prisma.feedback.findMany({
    select: {
      id: true,
      content: true,
    },
  });
  return feedbacks;
};

const delteAdminFromDB = async (id: string, adminId: string) => {
  if (id === adminId) {
    throw new ApiError(400, "Admin cannot delete their own account");
  }
  await prisma.admin.delete({ where: { id } });
  return;
};

const getAllBusinessFromDB = async (
  page: number = 1,
  search?: string,
  city?: string,
  region?: string,
  category?: TServiceCategory,
  isRecent?: string,
) => {
  const whereCondition: Prisma.UserWhereInput = {
    role: "Provider",
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(city || region || category
      ? {
          providerProfiles: {
            some: {
              ...(city && { city: { contains: city, mode: "insensitive" } }),
              ...(region && {
                region: { contains: region, mode: "insensitive" },
              }),
              ...(category && {
                serviceCategory: { equals: category },
              }),
            },
          },
        }
      : {}),
  };

  const totalBusiness = await prisma.user.count({
    where: { role: "Provider" },
  });

  const filteredBusinessCount = await prisma.user.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(filteredBusinessCount / 20);

  const business = await prisma.user.findMany({
    where: whereCondition,
    skip: (page - 1) * 20,
    take: 20,
    orderBy: {
      createdAt: isRecent === "true" ? "desc" : "asc",
    },
    select: {
      id: true,
      profileImage: true,
      fullName: true,
      phoneNumber: true,
      createdAt: true,
      status: true,
      providerProfiles: {
        select: {
          id: true,
          region: true,
          city: true,
          serviceCategory: true,
        },
      },
    },
  });

  const formula = await prisma.formula.findFirst({});
  const formulaDays = formula?.days ?? 30;
  const requiredServices = formula?.service ?? 1;
  const now = new Date();
  const activeWindowStart = new Date(
    now.getTime() - formulaDays * 24 * 60 * 60 * 1000,
  );

  const businessIds = business.map((item) => item.id);
  const bookingCountsInWindow =
    businessIds.length > 0
      ? await prisma.booking.groupBy({
          by: ["providerId"],
          where: {
            providerId: { in: businessIds },
            createdAt: { gte: activeWindowStart, lte: now },
            status: {
              in: ["Active", "Completed"],
            },
          },
          _count: { _all: true },
        })
      : [];

  const activeBusinessSet = new Set<string>();
  bookingCountsInWindow.forEach((item) => {
    const count = item._count._all;
    if (count >= requiredServices) {
      activeBusinessSet.add(item.providerId);
    }
  });

  const businessesWithFormulaStatus = business.map((item) => ({
    ...item,
    modifiedStatus: activeBusinessSet.has(item.id) ? "Active" : "Inactive",
  }));

  return {
    meta: {
      totalBusiness,
      filteredBusiness: filteredBusinessCount,
      totalPages,
      currentPage: page,
    },
    business: businessesWithFormulaStatus,
  };
};
const getAllServicesFromDB = async (
  page: number = 1,
  search?: string,
  region?: string,
  city?: string,
  category?: TServiceCategory,
) => {
  const whereCondition: Prisma.ServiceWhereInput = {
    ...(search && {
      OR: [{ serviceName: { contains: search, mode: "insensitive" } }],
    }),

    ...(region || city
      ? {
          provider: {
            providerProfiles: {
              some: {
                ...(region && {
                  region: { contains: region, mode: "insensitive" },
                }),
                ...(city && {
                  city: { contains: city, mode: "insensitive" },
                }),
              },
            },
          },
        }
      : {}),

    ...(category && {
      serviceCategory: { equals: category },
    }),
  };

  const totalServices = await prisma.service.count({});

  const filteredServicesCount = await prisma.service.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(filteredServicesCount / 20);

  const services = await prisma.service.findMany({
    where: whereCondition,
    skip: (page - 1) * 20,
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      serviceName: true,
      url1: true,
      serviceMode: true,
      servicePrice: true,
      serviceCategory: true,
      status: true,
      _count: {
        select: { bookings: true },
      },
      provider: {
        select: {
          id: true,
          fullName: true,
          providerProfiles: {
            select: {
              id: true,
              region: true,
              city: true,
            },
          },
        },
      },
      duration: true,
    },
  });

  return {
    meta: {
      totalServices,
      filteredServices: filteredServicesCount,
      totalPages,
      currentPage: page,
    },
    services,
  };
};
const getAllOffersFromDB = async (
  page: number = 1,
  search?: string,
  region?: string,
  city?: string,
  category?: TServiceCategory,
) => {
  const whereCondition: Prisma.OfferWhereInput = {
    ...(search && {
      OR: [{ serviceName: { contains: search, mode: "insensitive" } }],
    }),
    ...(region || city
      ? {
          provider: {
            providerProfiles: {
              some: {
                ...(region && {
                  region: { contains: region, mode: "insensitive" },
                }),
                ...(city && {
                  city: { contains: city, mode: "insensitive" },
                }),
              },
            },
          },
        }
      : {}),

    ...(category && {
      serviceCategory: { equals: category },
    }),
  };

  const totalOffers = await prisma.offer.count({});

  const filteredOffersCount = await prisma.offer.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(filteredOffersCount / 20);

  const offers = await prisma.offer.findMany({
    where: whereCondition,
    skip: (page - 1) * 20,
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      serviceName: true,
      mediaUrl: true,
      startDate: true,
      endDate: true,
      servicePrice: true,
      serviceCategory: true,
      maxBookingsPerHour: true,
      totalAvailableSlots: true,
      alreadyBooked: true,
      status: true,
      _count: {
        select: { bookings: true },
      },
      provider: {
        select: {
          id: true,
          fullName: true,
          providerProfiles: {
            select: {
              id: true,
              region: true,
              city: true,
            },
          },
        },
      },
    },
  });

  return {
    meta: {
      totalOffers,
      filteredOffers: filteredOffersCount,
      totalPages,
      currentPage: page,
    },
    offers,
  };
};
const getAllBookingsFromDB = async (
  page: number = 1,
  limit: number = 5,
  search?: string,
  region?: string,
  city?: string,
  category?: TServiceCategory,
  status?: BookingStatus,
) => {
  const providerProfileFilter: Prisma.UserWhereInput | undefined =
    region || city || category
      ? {
          providerProfiles: {
            some: {
              ...(region && {
                region: { contains: region, mode: "insensitive" },
              }),
              ...(city && {
                city: { contains: city, mode: "insensitive" },
              }),
              ...(category && {
                serviceCategory: category,
              }),
            },
          },
        }
      : undefined;

  const whereCondition: Prisma.BookingWhereInput = {
    ...(search && {
      OR: [
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { service: { serviceName: { contains: search, mode: "insensitive" } } },
        { offer: { serviceName: { contains: search, mode: "insensitive" } } },
      ],
    }),
    ...(providerProfileFilter && {
      provider: providerProfileFilter,
    }),
    ...(status && {
      status,
    }),
  };
  const totalBookings = await prisma.booking.count({});

  const filteredBookingsCount = await prisma.booking.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(filteredBookingsCount / limit);

  const bookings = await prisma.booking.findMany({
    where: whereCondition,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      date: true,
      time: true,
      price: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          fullName: true,
        },
      },
      service: {
        select: {
          serviceName: true,
          url1: true,
          serviceCategory: true,
        },
      },
      offer: {
        select: {
          serviceName: true,
          mediaUrl: true,
          serviceCategory: true,
        },
      },
      provider: {
        select: {
          id: true,
          fullName: true,
          providerProfiles: {
            select: {
              region: true,
              city: true,
            },
          },
        },
      },
    },
  });

  return {
    meta: {
      totalBookings,
      filteredBookings: filteredBookingsCount,
      totalPages,
      currentPage: page,
    },
    bookings,
  };
};
const getAllUsersFromDB = async (page: number = 1, search?: string) => {
  const whereCondition: Prisma.UserWhereInput = {
    role: "User",
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const totalUsers = await prisma.user.count({
    where: { role: "User" },
  });

  const filteredUsersCount = await prisma.user.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(filteredUsersCount / 20);

  const users = await prisma.user.findMany({
    where: whereCondition,
    skip: (page - 1) * 20,
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      profileImage: true,
      fullName: true,
      phoneNumber: true,
      createdAt: true,
      email: true,
      status: true,
      gender: true,
    },
  });

  const userIds = users.map((user) => user.id);

  const bookingStats =
    userIds.length > 0
      ? await prisma.booking.groupBy({
          by: ["userId", "status"],
          where: {
            userId: {
              in: userIds,
            },
          },
          _count: {
            _all: true,
          },
        })
      : [];

  const bookingStatsByUser = bookingStats.reduce<
    Record<
      string,
      { totalBookings: number; totalCompleted: number; totalCancelled: number }
    >
  >((acc, stat) => {
    if (!acc[stat.userId]) {
      acc[stat.userId] = {
        totalBookings: 0,
        totalCompleted: 0,
        totalCancelled: 0,
      };
    }

    const count = stat._count._all;
    acc[stat.userId].totalBookings += count;

    if (stat.status === "Completed") {
      acc[stat.userId].totalCompleted += count;
    }

    if (stat.status === "Cancelled") {
      acc[stat.userId].totalCancelled += count;
    }

    return acc;
  }, {});

  // Compute active user set based on formula (days + service count)
  const formula = await prisma.formula.findFirst({});
  const formulaDays = formula?.days ?? 30;
  const requiredServices = formula?.service ?? 1;
  const now = new Date();
  const activeWindowStart = new Date(
    now.getTime() - formulaDays * 24 * 60 * 60 * 1000,
  );

  // count bookings per user in the active window
  const bookingCountsInWindow =
    userIds.length > 0
      ? await prisma.booking.groupBy({
          by: ["userId"],
          where: {
            userId: { in: userIds },
            createdAt: { gte: activeWindowStart, lte: now },
          },
          _count: { _all: true },
        })
      : [];

  const activeUserSet = new Set<string>();
  bookingCountsInWindow.forEach((b) => {
    const count = (b._count as any)._all as number;
    if (count >= requiredServices) {
      activeUserSet.add(b.userId);
    }
  });

  const usersWithBookingSummary = users.map((user) => ({
    ...user,
    totalBookings: bookingStatsByUser[user.id]?.totalBookings || 0,
    totalCompleted: bookingStatsByUser[user.id]?.totalCompleted || 0,
    totalCancelled: bookingStatsByUser[user.id]?.totalCancelled || 0,
    // override status based on formula: user is considered active only if
    // their lastLogin is within `formula.days` and they have at least
    // `formula.service` bookings in that same window.
    status: ((): any => {
      try {
        return activeUserSet.has(user.id) ? "Active" : "Inactive";
      } catch (e) {
        return user.status;
      }
    })(),
  }));

  return {
    meta: {
      totalUsers,
      filteredUsers: filteredUsersCount,
      totalPages,
      currentPage: page,
    },
    users: usersWithBookingSummary,
  };
};
const deleteUserFromDB = async (id: string) => {
  await prisma.user.delete({ where: { id } });
  return;
};

const getBusinessDetailsFromDB = async (id: string) => {
  const business = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      profileImage: true,
      fullName: true,
      phoneNumber: true,
      email: true,
      createdAt: true,
      status: true,
      gender: true,
      vatNo: true,
      providerProfiles: {
        select: {
          id: true,
          region: true,
          city: true,
          serviceCategory: true,
          salonDescription: true,
          nidNote: true,
          nidUrl: true,
          logo: true,
          additionalNote: true,
          additionalPhoto: true,
          optionalNote: true,
          optionalPhoto: true,
          serviceType: true,
          vatUrl: true,
        },
      },
      services: {
        select: {
          id: true,
          serviceName: true,
          url1: true,
          serviceMode: true,
          servicePrice: true,
          serviceCategory: true,
          status: true,
          _count: {
            select: { bookings: true },
          },
          duration: true,
        },
      },
      offers: {
        select: {
          id: true,
          serviceName: true,
          serviceCategory: true,
          mediaUrl: true,
          startDate: true,
          endDate: true,
          totalAvailableSlots: true,
          maxBookingsPerHour: true,
          alreadyBooked: true,
          status: true,
          _count: {
            select: { bookings: true },
          },
        },
      },
      providerBookings: {
        select: {
          id: true,
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
          offer: {
            select: {
              serviceName: true,
            },
          },
          date: true,
          time: true,
          price: true,
          status: true,
        },
      },
      receivedReviews: {
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
          service: {
            select: {
              serviceName: true,
            },
          },
          offer: {
            select: {
              serviceName: true,
            },
          },
        },
      },
    },
  });
  const accessToken = jwtHelpers.generateToken(
    {
      id: business.id,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return {
    ...business,
    accessToken,
  };
};

const getUserDetailsFromDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id, role: "User" },
    select: {
      id: true,
      profileImage: true,
      fullName: true,
      phoneNumber: true,
      email: true,
      createdAt: true,
      status: true,
      gender: true,
      userBookings: {
        select: {
          id: true,
          provider: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
              providerProfiles: {
                select: {
                  id: true,
                  region: true,
                  city: true,
                },
              },
            },
          },
          service: {
            select: {
              serviceName: true,
              url1: true,
            },
          },
          offer: {
            select: {
              serviceName: true,
              mediaUrl: true,
            },
          },
          date: true,
          time: true,
          price: true,
          status: true,
        },
      },
      givenReviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          provider: {
            select: {
              fullName: true,
            },
          },
          service: {
            select: {
              serviceName: true,
            },
          },
          offer: {
            select: {
              serviceName: true,
            },
          },
        },
      },
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return {
    ...user,
    accessToken,
  };
};

const verifyOrRejectBusinessFromDB = async (id: string, status: string) => {
  const business = await prisma.user.findUniqueOrThrow({
    where: { id, role: "Provider" },
  });

  await prisma.user.update({
    where: { id: business.id },
    data: {
      status: status as "Active" | "Rejected",
    },
  });

  return {
    message: `Business has been ${status == "Active" ? "verified" : "rejected"}.`,
  };
};

const blockUnblockUserInDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      status: user.status === "Active" ? "Deactivated" : "Active",
    },
  });

  return {
    message: `User has been ${
      user.status === "Active" ? "blocked" : "unblocked"
    }.`,
  };
};

const getBusinessOverviewFromDB = async (type: "day" | "week" | "month") => {
  const totalBusiness = await prisma.user.count({
    where: {
      role: "Provider",
    },
  });
  const totalPending = await prisma.user.count({
    where: {
      role: "Provider",
      status: "Pending",
    },
  });
  const totalRejected = await prisma.user.count({
    where: {
      role: "Provider",
      status: "Rejected",
    },
  });

  const now = new Date();
  const startDate = new Date(now);

  if (type === "day") {
    startDate.setHours(0, 0, 0, 0);
  } else if (type === "week") {
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (type === "month") {
    startDate.setDate(now.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
  }

  const totalNew = await prisma.user.count({
    where: {
      role: "Provider",
      createdAt: {
        gte: startDate,
        lte: now,
      },
    },
  });

  const formula = await prisma.formula.findFirst({});
  const formulaDays = formula?.days ?? 30;
  const requiredServices = formula?.service ?? 1;
  const activeWindowStart = new Date(
    now.getTime() - formulaDays * 24 * 60 * 60 * 1000,
  );

  const bookingCountsInWindow = await prisma.booking.groupBy({
    by: ["providerId"],
    where: {
      status: {
        in: ["Active", "Completed"],
      },
      createdAt: { gte: activeWindowStart, lte: now },
    },
    _count: { _all: true },
  });

  const totalActive = bookingCountsInWindow.filter(
    (item) => item._count._all >= requiredServices,
  ).length;

  return { totalBusiness, totalActive, totalPending, totalRejected, totalNew };
};
const getUserOverviewFromDB = async (type: "day" | "week" | "month") => {
  const formula = await prisma.formula.findFirst({});
  const totalUser = await prisma.user.count({
    where: {
      role: "User",
    },
  });
  // totalBlocked remains the same (based on status)
  const totalBlocked = await prisma.user.count({
    where: {
      role: "User",
      status: "Deactivated",
    },
  });

  // Compute "active" users based on formula: a user is active if
  //  - they have at least `formula.service` bookings in the last `formula.days` days
  const now = new Date();
  const formulaDays = formula?.days ?? 30;
  const requiredServices = formula?.service ?? 1;

  const activeWindowStart = new Date(
    now.getTime() - formulaDays * 24 * 60 * 60 * 1000,
  );

  let totalActive = 0;
  const bookingCounts = await prisma.booking.groupBy({
    by: ["userId"],
    where: {
      createdAt: {
        gte: activeWindowStart,
        lte: now,
      },
    },
    _count: { _all: true },
  });

  totalActive = bookingCounts.filter(
    (b) => (b._count as any)._all >= requiredServices,
  ).length;

  // Compute totalNew according to the provided `type` (day/week/month)
  const startDate = new Date(now);
  if (type === "day") {
    startDate.setHours(0, 0, 0, 0);
  } else if (type === "week") {
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (type === "month") {
    startDate.setDate(now.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
  }

  const totalNew = await prisma.user.count({
    where: {
      role: "User",
      createdAt: {
        gte: startDate,
        lte: now,
      },
    },
  });

  return { totalUser, totalActive, totalNew, totalBlocked };
};

const getDashboardOverviewFromDB = async () => {
  const totalBusiness = await prisma.user.count({
    where: {
      role: "Provider",
    },
  });
  const totalClient = await prisma.user.count({
    where: {
      role: "User",
    },
  });
  const totalServices = await prisma.service.count();

  const totalEarnings = await prisma.booking.aggregate({
    where: {
      status: "Completed",
    },
    _sum: {
      price: true,
    },
  });

  return {
    totalBusiness,
    totalClient,
    totalServices,
    totalEarnings: totalEarnings._sum.price || 0,
  };
};

const getTopRatedBusinesses = async (
  page: number = 1,
  search?: string,
  isTopRated: string = "true",
) => {
  const whereCondition: Prisma.UserWhereInput = {
    role: "Provider",
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const totalBusiness = await prisma.user.count({
    where: { role: "Provider" },
  });

  const filteredBusinessCount = await prisma.user.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(filteredBusinessCount / 5);

  const business = await prisma.user.findMany({
    where: whereCondition,
    skip: (page - 1) * 5,
    take: 5,
    orderBy: [
      { avgRating: isTopRated === "true" ? "desc" : "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      profileImage: true,
      fullName: true,
      phoneNumber: true,
      avgRating: true,
      providerProfiles: {
        select: {
          id: true,
          region: true,
          city: true,
          serviceCategory: true,
        },
      },
    },
  });

  return {
    meta: {
      totalBusiness,
      filteredBusiness: filteredBusinessCount,
      totalPages,
      currentPage: page,
    },
    business,
  };
};

const getAllDashboardNotify = async () => {
  const notify = await prisma.dashNotify.findMany({
    orderBy: {
      createdAt: "desc",
    },
    omit: {
      updatedAt: true,
    },
  });

  return {
    notify,
  };
};

const deleteDashNotifyById = async (id: string) => {
  await prisma.dashNotify.delete({
    where: { id },
  });

  return;
};

const deleteAllDashNotify = async () => {
  await prisma.dashNotify.deleteMany({});
  return;
};

const getMostRequestedServices = async (
  page: number = 1,
  limit: number = 5,
  search?: string,
  city?: string,
  region?: string,
  category?: TServiceCategory,
) => {
  const whereCondition: Prisma.ServiceWhereInput = {
    ...(search && {
      OR: [{ serviceName: { contains: search, mode: "insensitive" } }],
    }),

    ...(region || city
      ? {
          provider: {
            providerProfiles: {
              some: {
                ...(region && {
                  region: { contains: region, mode: "insensitive" },
                }),
                ...(city && {
                  city: { contains: city, mode: "insensitive" },
                }),
              },
            },
          },
        }
      : {}),

    ...(category && {
      serviceCategory: { equals: category },
    }),
  };

  const totalServices = await prisma.service.count({});

  const filteredServicesCount = await prisma.service.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(filteredServicesCount / limit);

  const services = await prisma.service.findMany({
    where: whereCondition,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      bookings: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      serviceName: true,
      url1: true,
      serviceCategory: true,
      servicePrice: true,
      _count: {
        select: { bookings: true },
      },
      provider: {
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          providerProfiles: {
            select: {
              id: true,
              region: true,
              city: true,
            },
          },
        },
      },
      duration: true,
    },
  });

  return {
    meta: {
      totalServices,
      filteredServices: filteredServicesCount,
      totalPages,
      currentPage: page,
    },
    services,
  };
};

const getTopClientsFromDB = async (page: number = 1, search?: string) => {
  const whereCondition: Prisma.UserWhereInput = {
    role: "User",
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const totalUsers = await prisma.user.count({
    where: { role: "User" },
  });

  const filteredUsersCount = await prisma.user.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(filteredUsersCount / 5);

  const users = await prisma.user.findMany({
    where: whereCondition,
    skip: (page - 1) * 5,
    take: 5,
    orderBy: {
      userBookings: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      profileImage: true,
      fullName: true,
      phoneNumber: true,
      email: true,
      status: true,
      _count: {
        select: { userBookings: true },
      },
    },
  });

  return {
    meta: {
      totalUsers,
      filteredUsers: filteredUsersCount,
      totalPages,
      currentPage: page,
    },
    users,
  };
};

const createPrivacyPolicy = async (data: any) => {
  await prisma.privacyPolicy.upsert({
    where: {
      key: data.key,
    },
    create: {
      content: data.content,
      key: data.key,
    },
    update: {
      content: data.content,
    },
  });
  return;
};

const getPrivacyPolicy = async (key: PrivacyKey) => {
  const result = await prisma.privacyPolicy.findMany({
    where: { key },
    select: {
      id: true,
      content: true,
      key: true,
    },
  });
  return result;
};

const getBlockedUserListFromDB = async (role: UserRole, search?: string) => {
  const user = await prisma.user.findMany({
    where: {
      status: "Deactivated",
      role,
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { phoneNumber: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    select: {
      id: true,
      fullName: true,
      profileImage: true,
      phoneNumber: true,
      email: true,
      providerProfiles: {
        select: {
          id: true,
          city: true,
        },
      },
    },
  });

  return user;
};

const updateAdminProfileInDB = async (req: Request) => {
  const payload = req.body;
  const file = req.file;

  const admin = await prisma.admin.findUniqueOrThrow({
    where: { id: req.user.id },
  });

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const profileImage = file ? await processImage(file, "profileImage") : null;

  await prisma.admin.update({
    where: { id: req.user.id },
    data: {
      adminName: payload.adminName ?? admin.adminName,
      profileImage: profileImage ?? admin.profileImage,
      bio: payload.bio ?? admin.bio,
      city: payload.city ?? admin.city,
      region: payload.region ?? admin.region,
    },
  });

  return;
};

const createWelcomeMessage = async (data: any) => {
  await prisma.welcome.upsert({
    where: {
      key: data.key,
    },
    create: {
      content: data.content,
      key: data.key,
    },
    update: {
      content: data.content,
    },
  });
  return;
};

const getWelcomeMessage = async (key: UserRole) => {
  const result = await prisma.welcome.findMany({
    where: { key },
    select: {
      id: true,
      content: true,
      key: true,
    },
  });
  return result;
};

const getSentNotificationsFromDB = async (page: number = 1) => {
  const totalNotifications = await prisma.adminNotifications.count();

  const filteredNotificationCount = await prisma.adminNotifications.count({});

  const totalPages = Math.ceil(filteredNotificationCount / 20);

  const adminNotifications = await prisma.adminNotifications.findMany({
    skip: (page - 1) * 20,
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      receiver: true,
      content: true,
      user: {
        select: {
          userName: true,
          fullName: true,
          profileImage: true,
        },
      },
      createdAt: true,
    },
  });

  return {
    meta: {
      totalNotifications,
      filteredNotifications: filteredNotificationCount,
      totalPages,
      currentPage: page,
    },
    adminNotifications,
  };
};

const deleteSentNotificationFromDB = async (id: string) => {
  await prisma.adminNotifications.delete({
    where: { id },
  });
  return;
};

const getTopProvidersByEarnings = async () => {
  const calculateGrowthPercentage = (
    lastMonth: number,
    currentMonth: number,
  ) => {
    if (lastMonth === 0) {
      return currentMonth > 0 ? 100 : 0;
    }

    return Number((((currentMonth - lastMonth) / lastMonth) * 100).toFixed(2));
  };

  const now = new Date();
  const startOfCurrentMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const startOfLastMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );

  const grouped = await prisma.booking.groupBy({
    by: ["providerId"],
    where: {
      status: "Completed",
    },
    _sum: {
      price: true,
    },
    orderBy: {
      _sum: {
        price: "desc",
      },
    },
  });

  const currentMonthGrouped = await prisma.booking.groupBy({
    by: ["providerId"],
    where: {
      status: "Completed",
      date: {
        gte: startOfCurrentMonth,
      },
    },
    _sum: {
      price: true,
    },
  });

  const lastMonthGrouped = await prisma.booking.groupBy({
    by: ["providerId"],
    where: {
      status: "Completed",
      date: {
        gte: startOfLastMonth,
        lt: startOfCurrentMonth,
      },
    },
    _sum: {
      price: true,
    },
  });

  if (!grouped.length) return [];

  const providerIds = grouped.map((g) => g.providerId);

  const providers = await prisma.user.findMany({
    where: {
      id: { in: providerIds },
      role: "Provider",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      providerProfiles: {
        select: {
          serviceCategory: true,
          region: true,
          city: true,
        },
      },
      _count: {
        select: {
          providerBookings: {
            where: { status: "Completed" },
          },
          services: true,
        },
      },
    },
  });

  const providerMap = new Map(providers.map((p) => [p.id, p]));
  const currentMonthEarningsMap = new Map(
    currentMonthGrouped.map((g) => [g.providerId, g._sum.price || 0]),
  );
  const lastMonthEarningsMap = new Map(
    lastMonthGrouped.map((g) => [g.providerId, g._sum.price || 0]),
  );

  const result = grouped.map((g) => {
    const currentMonthEarnings = currentMonthEarningsMap.get(g.providerId) || 0;
    const lastMonthEarnings = lastMonthEarningsMap.get(g.providerId) || 0;

    return {
      provider: providerMap.get(g.providerId) || null,
      totalEarnings: g._sum.price || 0,
      currentMonthEarnings,
      lastMonthEarnings,
      growthPercentage: calculateGrowthPercentage(
        lastMonthEarnings,
        currentMonthEarnings,
      ),
    };
  });

  return result;
};

const getEarningSummaryFromDB = async (
  type: "daily" | "weekly" | "monthly" | "yearly",
) => {
  const getWeekSuffix = (weekNumber: number) => {
    if (weekNumber % 100 >= 11 && weekNumber % 100 <= 13) return "th";
    if (weekNumber % 10 === 1) return "st";
    if (weekNumber % 10 === 2) return "nd";
    if (weekNumber % 10 === 3) return "rd";
    return "th";
  };

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

  if (type === "daily") {
    const start = startOfWeek(new Date(), { weekStartsOn: 6 });
    const end = endOfWeek(new Date(), { weekStartsOn: 6 });

    const weekEarnings = await prisma.booking.findMany({
      where: {
        status: "Completed",
        date: { gte: start, lte: end },
      },
      select: { price: true, date: true },
    });

    const dailyData = Array(7).fill(0);

    for (const e of weekEarnings) {
      const dayIndex = getDay(e.date);
      const mappedIndex = (dayIndex - 6 + 7) % 7;
      dailyData[mappedIndex] += e.price;
    }

    chartData = days.map((day, idx) => ({
      day,
      earnings: dailyData[idx],
    }));
  }

  if (type === "weekly") {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    const monthEarnings = await prisma.booking.findMany({
      where: {
        status: "Completed",
        date: { gte: start, lte: end },
      },
      select: { price: true, date: true },
    });

    const monthStartIndex = (getDay(start) - 6 + 7) % 7;
    const totalWeeks = Math.ceil((monthStartIndex + end.getDate()) / 7);
    const weeklyData = Array(totalWeeks).fill(0);

    for (const e of monthEarnings) {
      const dayOffset = e.date.getDate() - 1;
      const weekIndex = Math.floor((monthStartIndex + dayOffset) / 7);
      weeklyData[weekIndex] += e.price;
    }

    chartData = weeklyData.map((earnings, idx) => {
      const weekNumber = idx + 1;
      return {
        week: `${weekNumber}${getWeekSuffix(weekNumber)} week`,
        earnings,
      };
    });
  }

  if (type === "monthly") {
    const start = startOfYear(new Date());
    const end = endOfYear(new Date());

    const yearEarnings = await prisma.booking.findMany({
      where: {
        status: "Completed",
        date: { gte: start, lte: end },
      },
      select: { price: true, date: true },
    });

    const monthlyData = Array(12).fill(0);

    for (const e of yearEarnings) {
      const monthIndex = getMonth(e.date);
      monthlyData[monthIndex] += e.price;
    }

    chartData = months.map((month, idx) => ({
      month,
      earnings: monthlyData[idx],
    }));
  }

  if (type === "yearly") {
    const allEarnings = await prisma.booking.findMany({
      where: {
        status: "Completed",
      },
      select: { price: true, date: true },
      orderBy: {
        date: "asc",
      },
    });

    const yearlyMap = new Map<number, number>();

    for (const e of allEarnings) {
      const year = e.date.getFullYear();
      yearlyMap.set(year, (yearlyMap.get(year) || 0) + e.price);
    }

    chartData = Array.from(yearlyMap.entries()).map(([year, earnings]) => ({
      year: String(year),
      earnings,
    }));
  }

  return {
    chartData,
  };
};

const getPerformanceSummaryFromDB = async (
  type: "daily" | "weekly" | "monthly" | "yearly",
) => {
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

  // 🔹 DAILY (current week)
  if (type === "daily") {
    const start = startOfWeek(new Date(), { weekStartsOn: 6 });
    const end = endOfWeek(new Date(), { weekStartsOn: 6 });

    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["Completed", "Cancelled"] },
        date: { gte: start, lte: end },
      },
      select: { date: true, status: true },
    });

    const data = Array(7)
      .fill(null)
      .map(() => ({
        completed: 0,
        cancelled: 0,
      }));

    for (const b of bookings) {
      const dayIndex = getDay(b.date);
      const mappedIndex = (dayIndex - 6 + 7) % 7;

      if (b.status === "Completed") data[mappedIndex].completed++;
      if (b.status === "Cancelled") data[mappedIndex].cancelled++;
    }

    chartData = days.map((day, idx) => ({
      day,
      completed: data[idx].completed,
      cancelled: data[idx].cancelled,
    }));
  }

  // 🔹 WEEKLY (current month)
  if (type === "weekly") {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["Completed", "Cancelled"] },
        date: { gte: start, lte: end },
      },
      select: { date: true, status: true },
    });

    const monthStartIndex = (getDay(start) - 6 + 7) % 7;
    const totalWeeks = Math.ceil((monthStartIndex + end.getDate()) / 7);

    const data = Array(totalWeeks)
      .fill(null)
      .map(() => ({
        completed: 0,
        cancelled: 0,
      }));

    for (const b of bookings) {
      const dayOffset = b.date.getDate() - 1;
      const weekIndex = Math.floor((monthStartIndex + dayOffset) / 7);

      if (b.status === "Completed") data[weekIndex].completed++;
      if (b.status === "Cancelled") data[weekIndex].cancelled++;
    }

    chartData = data.map((item, idx) => ({
      week: `Week ${idx + 1}`,
      completed: item.completed,
      cancelled: item.cancelled,
    }));
  }

  // 🔹 MONTHLY (current year)
  if (type === "monthly") {
    const start = startOfYear(new Date());
    const end = endOfYear(new Date());

    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["Completed", "Cancelled"] },
        date: { gte: start, lte: end },
      },
      select: { date: true, status: true },
    });

    const data = Array(12)
      .fill(null)
      .map(() => ({
        completed: 0,
        cancelled: 0,
      }));

    for (const b of bookings) {
      const monthIndex = getMonth(b.date);

      if (b.status === "Completed") data[monthIndex].completed++;
      if (b.status === "Cancelled") data[monthIndex].cancelled++;
    }

    chartData = months.map((month, idx) => ({
      month,
      completed: data[idx].completed,
      cancelled: data[idx].cancelled,
    }));
  }

  // 🔹 YEARLY (all time)
  if (type === "yearly") {
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["Completed", "Cancelled"] },
      },
      select: { date: true, status: true },
      orderBy: { date: "asc" },
    });

    const map = new Map<number, { completed: number; cancelled: number }>();

    for (const b of bookings) {
      const year = b.date.getFullYear();

      if (!map.has(year)) {
        map.set(year, { completed: 0, cancelled: 0 });
      }

      const entry = map.get(year)!;

      if (b.status === "Completed") entry.completed++;
      if (b.status === "Cancelled") entry.cancelled++;
    }

    chartData = Array.from(map.entries()).map(([year, val]) => ({
      year: String(year),
      completed: val.completed,
      cancelled: val.cancelled,
    }));
  }

  return { chartData };
};

const deleteReviewFromDB = async (id: string) => {
  const review = await prisma.review.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      rating: true,
      providerId: true,
      bookingId: true,
    },
  });

  const provider = await prisma.user.findUniqueOrThrow({
    where: { id: review.providerId },
    select: {
      id: true,
      avgRating: true,
      totalReview: true,
    },
  });

  const currentTotalReview = provider.totalReview || 0;
  const nextTotalReview = Math.max(currentTotalReview - 1, 0);
  const nextAvgRating =
    nextTotalReview === 0
      ? 0
      : Number(
          (
            (provider.avgRating * currentTotalReview - review.rating) /
            nextTotalReview
          ).toFixed(2),
        );

  await prisma.$transaction([
    prisma.review.delete({
      where: { id },
    }),
    prisma.booking.update({
      where: { id: review.bookingId },
      data: { isReviewed: false },
    }),
    prisma.user.update({
      where: { id: review.providerId },
      data: {
        totalReview: nextTotalReview,
        avgRating: nextAvgRating,
      },
    }),
  ]);

  return;
};

const updateReviewInDB = async (payload: any) => {
  const review = await prisma.review.findUniqueOrThrow({
    where: { id: payload.reviewId },
    select: {
      id: true,
      rating: true,
      comment: true,
      providerId: true,
    },
  });

  const provider = await prisma.user.findUniqueOrThrow({
    where: { id: review.providerId },
    select: {
      id: true,
      avgRating: true,
      totalReview: true,
    },
  });

  const currentTotalReview = provider.totalReview || 0;
  const nextRating = payload.rating ?? review.rating;
  const nextComment = payload.comment ?? review.comment;
  const nextAvgRating =
    currentTotalReview === 0
      ? 0
      : Number(
          (
            (provider.avgRating * currentTotalReview -
              review.rating +
              nextRating) /
            currentTotalReview
          ).toFixed(2),
        );

  await prisma.$transaction([
    prisma.review.update({
      where: { id: payload.reviewId },
      data: {
        rating: nextRating,
        comment: nextComment,
      },
    }),
    prisma.user.update({
      where: { id: review.providerId },
      data: {
        avgRating: nextAvgRating,
      },
    }),
  ]);

  return;
};

const getBusinessCompletedBookingsFromDB = async (businessId: string) => {
  const completedBookings = await prisma.booking.findMany({
    where: {
      providerId: businessId,
      status: "Completed",
    },
    select: {
      id: true,
      date: true,
      time: true,
      price: true,
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
      offer: {
        select: {
          serviceName: true,
        },
      },
    },
  });
  return completedBookings;
};
const deleteOfferFromDB = async (id: string) => {
  await prisma.offer.delete({ where: { id } });
  return;
};

const acceptOrRejectOfferInDB = async (
  offerId: string,
  isAccepted: boolean,
) => {
  await prisma.offer.findUniqueOrThrow({
    where: { id: offerId, status: "Pending" },
  });

  await prisma.offer.update({
    where: { id: offerId },
    data: { status: isAccepted ? "Active" : "Deactivated" },
  });

  return {
    message: isAccepted
      ? "Offer accepted successfully"
      : "Offer rejected successfully",
  };
};

const getOfferDetailsFromDB = async (offerId: string) => {
  const offer = await prisma.offer.findUniqueOrThrow({
    where: { id: offerId },
    select: {
      id: true,
      serviceName: true,
      serviceCategory: true,
      mediaUrl: true,
      startDate: true,
      endDate: true,
      status: true,
      description: true,
      endTime: true,
      startTime: true,
      servicePrice: true,
      alreadyBooked: true,
      totalAvailableSlots: true,
      maxBookingsPerHour: true,
      location: true,
      _count: {
        select: { bookings: true },
      },
      provider: {
        select: {
          fullName: true,
          providerProfiles: {
            select: {
              region: true,
              city: true,
              serviceCategory: true,
            },
          },
        },
      },
    },
  });
  return offer;
};

const deleteServiceFromDB = async (serviceId: string) => {
  await prisma.service.delete({ where: { id: serviceId } });
  return;
};

const getServiceDetailsFromDB = async (serviceId: string) => {
  const service = await prisma.service.findUniqueOrThrow({
    where: { id: serviceId },
    select: {
      id: true,
      serviceName: true,
      serviceCategory: true,
      url1: true,
      servicePrice: true,
      duration: true,
      serviceMode: true,
      description: true,
      provider: {
        select: {
          fullName: true,
        },
      },
    },
  });

  return service;
};

const updateProviderBusinessInfoByAdmin = async (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const payload = req.body;

  const existingProfile = await prisma.providerProfile.findFirst({
    where: { providerId: payload.providerId },
  });

  const provider = await prisma.user.findUniqueOrThrow({
    where: { id: payload.providerId },
  });

  if (!existingProfile) {
    throw new ApiError(404, "Provider profile not found.");
  }

  const processImages = async (
    files: Express.Multer.File[] | undefined,
    folder: string,
  ) => {
    if (!files || files.length === 0) return null;
    return Promise.all(
      files.map((file) => uploadInSpace(file, `courses/${folder}`)),
    );
  };

  const [logo, vatUrl, nidUrl, additionalPhoto] = await Promise.all([
    processImages(files?.logo, "logo"),
    processImages(files?.vatUrl, "vatUrl"),
    processImages(files?.nidUrl, "nidUrl"),
    processImages(files?.additionalPhoto, "additionalPhoto"),
  ]);

  const updateData: Record<string, unknown> = {};

  if (payload.city !== undefined) updateData.city = payload.city;
  if (payload.region !== undefined) updateData.region = payload.region;
  if (payload.serviceCategory !== undefined)
    updateData.serviceCategory = payload.serviceCategory;
  if (payload.serviceType !== undefined)
    updateData.serviceType = payload.serviceType;
  if (payload.salonDescription !== undefined)
    updateData.salonDescription = payload.salonDescription;
  if (payload.additionalNote !== undefined)
    updateData.additionalNote = payload.additionalNote;
  if (payload.optionalNote !== undefined)
    updateData.optionalNote = payload.optionalNote;
  if (payload.nidNote !== undefined) updateData.nidNote = payload.nidNote;

  if (logo?.[0]) updateData.logo = logo[0];
  if (vatUrl?.[0]) updateData.vatUrl = vatUrl[0];
  if (nidUrl?.[0]) updateData.nidUrl = nidUrl[0];
  if (additionalPhoto?.[0]) updateData.additionalPhoto = additionalPhoto[0];

  if (Object.keys(updateData).length === 0) {
    return existingProfile;
  }

  await prisma.providerProfile.update({
    where: { id: existingProfile.id },
    data: updateData,
  });

  await prisma.user.update({
    where: { id: payload.providerId },
    data: {
      email: payload.email ?? provider.email,
      fullName: payload.fullName ?? provider.fullName,
      phoneNumber: payload.phoneNumber ?? provider.phoneNumber,
    },
  });

  return;
};

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      role: { not: "Admin" },
    },
    select: {
      id: true,
      fullName: true,
      profileImage: true,
    },
  });
  return users;
};

const getCurrentNotifyOptionFromDB = async () => {
  const notifyOption = await prisma.notifyOption.findFirst({
    omit: {
      createdAt: true,
      updatedAt: true,
    },
  });
  return notifyOption;
};

const updateNotifyOption = async (payload: any) => {
  const notifyOption = await prisma.notifyOption.findFirst({});

  if (!notifyOption) {
    return;
  }

  await prisma.notifyOption.update({
    where: {
      id: notifyOption.id,
    },
    data: {
      clientRegistered:
        payload.clientRegistered ?? notifyOption.clientRegistered,
      businessRegistered:
        payload.businessRegistered ?? notifyOption.businessRegistered,
      bookingCancelled:
        payload.bookingCancelled ?? notifyOption.bookingCancelled,
      newAdvertisement:
        payload.newAdvertisement ?? notifyOption.newAdvertisement,
      newBooking: payload.newBooking ?? notifyOption.newBooking,
      newFeedback: payload.newFeedback ?? notifyOption.newFeedback,
      offerExpirty: payload.offerExpirty ?? notifyOption.offerExpirty,
    },
  });

  return;
};

const updateActivationFormula = async (payload: any) => {
  const existingFormula = await prisma.formula.findFirst({});

  if (existingFormula) {
    await prisma.formula.update({
      where: { id: existingFormula.id },
      data: {
        days: payload.days ?? existingFormula.days,
        service: payload.service ?? existingFormula.service,
      },
    });
  }

  if (!existingFormula) {
    await prisma.formula.create({
      data: {
        days: payload.days,
        service: payload.service,
      },
    });
  }

  return;
};

const getCurrentFormula = async () => {
  const formula = await prisma.formula.findFirst({
    omit: {
      createdAt: true,
      updatedAt: true,
    },
  });

  return formula;
};

export const adminService = {
  deleteAllDashNotify,
  deleteDashNotifyById,
  getCurrentFormula,
  updateActivationFormula,
  getAllDashboardNotify,
  deleteServiceFromDB,
  getServiceDetailsFromDB,
  getOfferDetailsFromDB,
  acceptOrRejectOfferInDB,
  deleteOfferFromDB,
  getBusinessCompletedBookingsFromDB,
  getEarningSummaryFromDB,
  deleteReviewFromDB,
  updateReviewInDB,
  getPerformanceSummaryFromDB,
  getDashboardOverviewFromDB,
  getTopProvidersByEarnings,
  getBlockedUserListFromDB,
  getSentNotificationsFromDB,
  deleteSentNotificationFromDB,
  updateProviderBusinessInfoByAdmin,
  loginAdminIntoDB,
  createFaqIntoDB,
  getAllFaqsFromDB,
  getSingleFaqFromDB,
  deleteFaqFromDB,
  getAllBusinessFromDB,
  updateFaqIntoDB,
  sendForgotPasswordOtpDB,
  verifyOrRejectBusinessFromDB,
  updateAdminProfileInDB,
  createReasonIntoDB,
  getAllReasonsFromDB,
  getSingleReasonFromDB,
  deleteReasonFromDB,
  updateReasonIntoDB,
  changePasswordFromDB,
  getUserOverviewFromDB,
  createNewAdminIntoDB,
  getAdminListFromDB,
  verifyForgotPasswordOtpCodeDB,
  getAllBookingsFromDB,
  resetForgotPasswordDB,
  getFeedbacksFromDB,
  getSingleAdminFromDB,
  delteAdminFromDB,
  deleteUserFromDB,
  getBusinessDetailsFromDB,
  createWelcomeMessage,
  getWelcomeMessage,
  blockUnblockUserInDB,
  getAllUsersFromDB,
  getUserDetailsFromDB,
  getBusinessOverviewFromDB,
  getAdminProfileFromDB,
  getAllServicesFromDB,
  getAllOffersFromDB,
  sendNotificationsToUsers,
  getTopRatedBusinesses,
  getMostRequestedServices,
  getTopClientsFromDB,
  createPrivacyPolicy,
  getPrivacyPolicy,
  getAllUsers,
  getCurrentNotifyOptionFromDB,
  updateNotifyOption,
};
