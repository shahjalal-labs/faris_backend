import {
  PendingUser,
  Prisma,
  TServiceCategory,
  TServiceType,
} from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import bcrypt from "bcryptjs";
import { Request } from "express";
import { uploadInSpace } from "../../../shared/UploadHelper";
import { sendSingleNotification } from "../notifications/notification.services";
import {
  sendOtpAuthentica,
  verifyOtpAuthentica,
} from "../../../helpers/sendSms";

const createPendingUserInDB = async (payload: PendingUser) => {
  const existingPhone = await prisma.user.findFirst({
    where: { phoneNumber: payload.phoneNumber },
  });
  const existingEmail = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (existingPhone || existingEmail) {
    throw new ApiError(
      409,
      "User already exists with this phone number or email",
    );
  }

  if (payload.role === "Provider" && !payload.vatNo) {
    throw new ApiError(400, "VAT number is required for providers");
  }

  const response = await sendOtpAuthentica(payload.phoneNumber, "sms");
  // const response = { success: true, message: "Otp sent successfully" };
  const hashedPassword = await bcrypt.hash(payload.password as string, 10);

  if (response.success == true) {
    await prisma.pendingUser.upsert({
      where: {
        phoneNumber: payload.phoneNumber,
      },
      create: {
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        fcmToken: payload.fcmToken,
        fullName: payload.fullName,
        vatNo: payload.vatNo,
        role: payload.role,
        password: hashedPassword,
      },
      update: {
        email: payload.email,
        fcmToken: payload.fcmToken,
        fullName: payload.fullName,
        vatNo: payload.vatNo,
        role: payload.role,
        password: hashedPassword,
      },
    });
    return { success: true, message: response.message, statusCode: 200 };
  } else {
    return { success: false, message: response.message, statusCode: 400 };
  }
};

const verifySignupOtpFromDB = async (phoneNumber: string, otp: string) => {
  const existingRequest = await prisma.pendingUser.findUniqueOrThrow({
    where: { phoneNumber },
  });

  const welcomeUser = await prisma.welcome.findFirst({
    where: { key: "User" },
  });
  const welcomeProvider = await prisma.welcome.findFirst({
    where: { key: "Provider" },
  });

  if (!existingRequest) {
    throw new ApiError(409, "No user request sent using this phone number");
  }

  const existingUser = await prisma.user.findUnique({
    where: { phoneNumber, email: existingRequest.email },
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User already exists with this phone number or email",
    );
  }

  const response = await verifyOtpAuthentica(phoneNumber, "phone", otp);
  // const response = { status: true, message: "Verification successfull", otp };

  if (response.status === false) {
    throw new ApiError(404, `${response.message}`);
  }

  await prisma.pendingUser.delete({
    where: { phoneNumber, email: existingRequest.email },
  });

  const user = await prisma.user.create({
    data: {
      phoneNumber: existingRequest.phoneNumber,
      email: existingRequest.email,
      fcmToken: existingRequest.fcmToken,
      vatNo: existingRequest.vatNo,
      fullName: existingRequest.fullName,
      password: existingRequest.password,
      role: existingRequest.role,
      status: existingRequest.role === "Provider" ? "Pending" : "Active",
    },
  });

  await prisma.dashNotify.create({
    data: {
      title: `New ${user.role == "Provider" ? "Business" : "Client"} Signup`,
      content: `A new ${existingRequest.role == "Provider" ? "Business" : "Client"} has signed up with the name ${user.fullName} and phone number ${user.phoneNumber}. Please review their profile and take necessary actions.`,
      additionalDetails: "dsfsfsd",
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  try {
    await sendSingleNotification(
      user.id,
      `${user.role === "User" ? welcomeUser?.content : welcomeProvider?.content}`,
      user.id,
      "أهلاً بك في منصة شعرة",
    );
  } catch (notificationError) {
    console.error("Notification failed:", notificationError);
  }

  return {
    success: true,
    id: user.id,
    message: "User created successfully",
    accessToken,
    isSetup: false,
    role: user.role,
  };
};

const sendLoginOtpToPhone = async (payload: PendingUser) => {
  if (!payload.phoneNumber) {
    throw new ApiError(404, "Phone number is required");
  }

  const user = await prisma.user.findUnique({
    where: { phoneNumber: payload.phoneNumber },
  });

  if (!user) {
    throw new ApiError(404, "User not found with this phone number");
  }

  if (user?.status == "Deactivated") {
    throw new ApiError(403, "Account deactivated by Admin");
  }

  const response = await sendOtpAuthentica(payload.phoneNumber, "sms");
  // const response = { success: true, message: "Otp sent successfully" };

  if (response.success == true) {
    return { success: true, message: response.message, statusCode: 200 };
  }
  return { success: false, message: response.message, statusCode: 400 };
};

const verifyLoginOtpFromDB = async (
  phoneNumber: string,
  otp: string,
  fcmToken?: string,
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { phoneNumber },
  });

  if (!user) {
    throw new ApiError(404, "User not found with this phone number");
  }

  const response = await verifyOtpAuthentica(phoneNumber, "phone", otp);
  // const response = { status: true, message: "Verification successfull", otp };

  if (response.status === false) {
    throw new ApiError(404, `${response.message}`);
  }

  if (fcmToken) {
    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken: fcmToken },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return {
    success: true,
    message: "Logged in successfully",
    id: user.id,
    accessToken,
    isSetup: user.isSetup,
    role: user.role,
  };
};

const loginUsingEmailAndPassword = async (payload: any) => {
  const user = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user?.status == "Deactivated") {
    throw new ApiError(403, "Account deactivated by Admin");
  }

  const isPasswordValid = await bcrypt.compare(
    payload.password,
    user?.password as string,
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (payload.fcmToken) {
    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken: payload.fcmToken },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return {
    id: user.id,
    accessToken,
    isSetup: user.isSetup,
    role: user.role,
  };
};

const getUserProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      profileImage: true,
      phoneNumber: true,
      gender: true,
      dob: true,
      status: true,
      providerProfiles: {
        select: {
          bookingAutoAccept: true,
        },
      },
    },
  });

  return user;
};

const updateUserProfileInDB = async (req: Request) => {
  const payload = req.body;
  const file = req.file;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user.id },
  });

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const profileImage = file ? await processImage(file, "profileImage") : null;

  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      fullName: payload.fullName ?? user.fullName,
      profileImage: profileImage ?? user.profileImage,
      gender: payload.gender ?? user.gender,
      dob: payload.dob ?? user.dob,
    },
  });

  return;
};

const getProfileOverviewData = async (providerId: string) => {
  const provider = await prisma.user.findUniqueOrThrow({
    where: { id: providerId, role: "Provider" },
    select: {
      id: true,
      fullName: true,
      profileImage: true,
      providerProfiles: {
        select: {
          earnings: true,
          bookingAutoAccept: true,
        },
      },
      providerBookings: {
        where: { status: "Active" },
        select: {
          id: true,
          price: true,
          date: true,
          time: true,
          user: {
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
      offers: {
        select: {
          id: true,
          serviceName: true,
          status: true,
          servicePrice: true,
          mediaUrl: true,
        },
      },
    },
  });

  return provider;
};

const getAllBusinessFromDB = async (
  search?: string,
  city?: string,
  region?: string,
  category?: TServiceCategory,
  type?: TServiceType,
) => {
  const categoryCondition = category
    ? category === "Both"
      ? { equals: category }
      : { in: [category, "Both"] as TServiceCategory[] }
    : undefined;

  const whereCondition: Prisma.UserWhereInput = {
    role: "Provider",
    status: "Active",
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(city || region || category || type
      ? {
          providerProfiles: {
            some: {
              ...(city && { city: { contains: city, mode: "insensitive" } }),
              ...(region && {
                region: { contains: region, mode: "insensitive" },
              }),
              ...(categoryCondition && {
                serviceCategory: categoryCondition,
              }),
              ...(type && {
                serviceType: { equals: type },
              }),
            },
          },
        }
      : {}),
  };

  const business = await prisma.user.findMany({
    where: whereCondition,
    orderBy: {
      avgRating: "desc",
    },
    select: {
      id: true,
      profileImage: true,
      fullName: true,
      phoneNumber: true,
      avgRating: true,
      totalReview: true,
      createdAt: true,
      status: true,
      providerProfiles: {
        select: {
          id: true,
          region: true,
          city: true,
          serviceCategory: true,
          serviceType: true,
          logo: true,
        },
      },
    },
  });

  return {
    business,
  };
};

const getSingleBusinessFromDB = async (businessId: string, userId: string) => {
  const businessDetails = await prisma.user.findUniqueOrThrow({
    where: { id: businessId },
    select: {
      id: true,
      avgRating: true,
      totalReview: true,
      phoneNumber: true,
      fullName: true,
      profileImage: true,
      providerProfiles: {
        select: {
          salonDescription: true,
          city: true,
          locationLink: true,
          logo: true,
        },
      },
    },
  });
  const sevices = await prisma.service.findMany({
    where: {
      providerId: businessId,
      status: "Active",
    },
    select: {
      id: true,
      serviceName: true,
      url1: true,
      duration: true,
      description: true,
      notes: true,
      servicePrice: true,
      totalProvider: true,
      serviceMode: true,
      serviceCategory: true,
      favourites: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  const today = new Date().toISOString().split("T")[0];

  const offers = await prisma.offer.findMany({
    where: {
      providerId: businessId,
      status: "Active",
      endDate: { gte: today },
    },
    select: {
      id: true,
      serviceName: true,
      mediaUrl: true,
      servicePrice: true,
      maxBookingsPerHour: true,
      totalAvailableSlots: true,
      alreadyBooked: true,
    },
  });

  const reviews = await prisma.review.findMany({
    where: { providerId: businessId },
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
  });

  return {
    businessDetails,
    sevices,
    offers,
    reviews,
  };
};
const getSingleBusinessFromDBForGuest = async (businessId: string) => {
  const businessDetails = await prisma.user.findUniqueOrThrow({
    where: { id: businessId },
    select: {
      id: true,
      avgRating: true,
      totalReview: true,
      phoneNumber: true,
      fullName: true,
      profileImage: true,

      providerProfiles: {
        select: {
          salonDescription: true,
          city: true,
          locationLink: true,
          logo: true,
        },
      },
    },
  });
  const sevices = await prisma.service.findMany({
    where: {
      providerId: businessId,
      status: "Active",
    },
    select: {
      id: true,
      serviceName: true,
      url1: true,
      duration: true,
      description: true,
      notes: true,
      servicePrice: true,
      totalProvider: true,
      serviceCategory: true,
      serviceMode: true,
    },
  });

  const today = new Date().toISOString().split("T")[0];

  const offers = await prisma.offer.findMany({
    where: {
      providerId: businessId,
      status: "Active",
      endDate: { gte: today },
    },
    select: {
      id: true,
      serviceName: true,
      mediaUrl: true,
      servicePrice: true,
      maxBookingsPerHour: true,
      totalAvailableSlots: true,
      alreadyBooked: true,
    },
  });

  const reviews = await prisma.review.findMany({
    where: { providerId: businessId },
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
  });

  return {
    businessDetails,
    sevices,
    offers,
    reviews,
  };
};

const deleteAccountFromDB = async (userId: string, password: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const isPasswordValid = await bcrypt.compare(
    password,
    user?.password as string,
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  await prisma.user.delete({
    where: { id: userId },
  });
  return;
};

export const userService = {
  createPendingUserInDB,
  verifySignupOtpFromDB,
  sendLoginOtpToPhone,
  verifyLoginOtpFromDB,
  loginUsingEmailAndPassword,
  getUserProfileFromDB,
  updateUserProfileInDB,
  getProfileOverviewData,
  getAllBusinessFromDB,
  getSingleBusinessFromDB,
  getSingleBusinessFromDBForGuest,
  deleteAccountFromDB,
};
