import { UserLocation } from "@prisma/client";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import { Request } from "express";
import { uploadInSpace } from "../../../shared/UploadHelper";
import {
  sendOtpAuthentica,
  verifyOtpAuthentica,
} from "../../../helpers/sendSms";

const sendForgotPasswordOtpDB = async (email: string) => {
  const existringUser = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  if (!existringUser) {
    throw new ApiError(404, "User not found");
  }

  const response = await sendOtpAuthentica(existringUser.phoneNumber, "sms");

  if (!response.success) {
    throw new ApiError(500, "Failed to send OTP. Please try again later.");
  }

  return;
};

const verifyForgotPasswordOtpCodeDB = async (payload: any) => {
  const { email, otp } = payload;

  if (!email && !otp) {
    throw new ApiError(400, "Email and OTP are required.");
  }

  const user = await prisma.user.findFirst({ where: { email: email } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const response = await verifyOtpAuthentica(user.phoneNumber, "phone", otp);

  if (!response.status) {
    throw new ApiError(400, `${response.message}`);
  }

  const accessToken = jwtHelpers.generateToken(
    { id: user.id, email },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string,
  );

  return { accessToken: accessToken };
};

const resetForgotPasswordDB = async (newPassword: string, userId: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new ApiError(404, "user not found");
  }
  const email = existingUser.email as string;
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.jwt.gen_salt),
  );

  await prisma.user.updateMany({
    where: {
      email: email,
    },
    data: {
      password: hashedPassword,
    },
  });

  return;
};

const userLocationUpdateIntoDB = async (
  userId: string,
  userLocation: UserLocation,
) => {
  const location = await prisma.userLocation.findFirst({
    where: { userId: userId },
  });
  if (!location) {
    const result = await prisma.userLocation.create({
      data: { ...userLocation, userId: userId },
    });

    return result;
  }

  const result = await prisma.userLocation.update({
    where: { id: location.id },
    data: userLocation,
  });

  return result;
};

const setupProviderBusinessInfoDB = async (req: Request) => {
  const providerId = req.user.id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const payload = req.body;

  const processImages = async (
    files: Express.Multer.File[] | undefined,
    folder: string,
  ) => {
    if (!files || files.length === 0) return null;
    return Promise.all(
      files.map((file) => uploadInSpace(file, `courses/${folder}`)),
    );
  };

  const [logo, vatUrl, nidUrl, additionalPhoto, optionalPhoto] =
    await Promise.all([
      processImages(files?.logo, "logo"),
      processImages(files?.vatUrl, "vatUrl"),
      processImages(files?.nidUrl, "nidUrl"),
      processImages(files?.additionalPhoto, "additionalPhoto"),
      processImages(files?.optionalPhoto, "optionalPhoto"),
    ]);

  // if (!logo) {
  //   throw new ApiError(400, "Logo is required.");
  // }
  // if (!vatUrl) {
  //   throw new ApiError(400, "VAT URL is required.");
  // }
  // if (!nidUrl) {
  //   throw new ApiError(400, "NID URL is required.");
  // }

  await prisma.providerProfile.create({
    data: {
      providerId,
      city: payload.city,
      region: payload.region,
      serviceCategory: payload.serviceCategory,
      serviceType: payload.serviceType,
      salonDescription: payload.salonDescription,
      logo: logo?.[0] as string,
      vatUrl: vatUrl?.[0] as string,
      nidUrl: nidUrl?.[0] as string,
      additionalPhoto: additionalPhoto?.[0] ?? null,
      optionalPhoto: optionalPhoto?.[0] ?? null,
      additionalNote: payload.additionalNote,
      optionalNote: payload.optionalNote,
      nidNote: payload.nidNote,
    },
  });

  await prisma.user.update({
    where: { id: providerId },
    data: { isSetup: true },
  });
};

const getBusinessInfoFromDB = async (providerId: string) => {
  const result = await prisma.providerProfile.findFirst({
    where: { providerId },
  });

  return result;
};

const updateProviderBusinessInfoDB = async (req: Request) => {
  const providerId = req.user.id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const payload = req.body;

  const existingProfile = await prisma.providerProfile.findFirst({
    where: { providerId },
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

  const [logo, vatUrl, nidUrl, additionalPhoto, optionalPhoto] =
    await Promise.all([
      processImages(files?.logo, "logo"),
      processImages(files?.vatUrl, "vatUrl"),
      processImages(files?.nidUrl, "nidUrl"),
      processImages(files?.additionalPhoto, "additionalPhoto"),
      processImages(files?.optionalPhoto, "optionalPhoto"),
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
  if (optionalPhoto?.[0]) updateData.optionalPhoto = optionalPhoto[0];

  if (Object.keys(updateData).length === 0) {
    return existingProfile;
  }

  const result = await prisma.providerProfile.update({
    where: { id: existingProfile.id },
    data: updateData,
  });

  return result;
};

const updateBusinessLocationInDB = async (
  providerId: string,
  location: string,
) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: providerId },
  });

  await prisma.providerProfile.updateMany({
    where: { providerId },
    data: { locationLink: location },
  });

  return;
};

const getBusinessLocation = async (providerId: string) => {
  const result = await prisma.providerProfile.findFirst({
    where: { providerId },
    select: { locationLink: true },
  });
  return result;
};

const logOutFromDB = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { fcmToken: null },
  });

  return;
};

export const authService = {
  sendForgotPasswordOtpDB,
  verifyForgotPasswordOtpCodeDB,
  resetForgotPasswordDB,
  userLocationUpdateIntoDB,
  setupProviderBusinessInfoDB,
  getBusinessLocation,
  updateProviderBusinessInfoDB,
  getBusinessInfoFromDB,
  updateBusinessLocationInDB,
  logOutFromDB,
};

// const sendForgotPasswordOtpDB = async (email: string) => {
//   const existringUser = await prisma.user.findFirst({
//     where: {
//       email: email,
//     },
//   });
//   if (!existringUser) {
//     throw new ApiError(404, "User not found");
//   }
//   // Generate OTP and expiry time
//   const otp = generateOTP(); // 4-digit OTP
//   const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
//   const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
//   const subject = "Your Password Reset OTP";
//   const html = `
//   <div style="font-family: Arial, sans-serif; color: #333;">
//     <h2>Password Reset Request</h2>
//     <p>Hi <b>${existringUser.userName}</b>,</p>
//     <p>Your OTP for password reset is:</p>
//     <h1 style="color: #007BFF;">${otp}</h1>
//     <p>This OTP is valid for <b>5 minutes</b>. If you did not request this, please ignore this email.</p>
//     <p>Thanks, <br>The Support Team</p>
//   </div>
// `;
//   // await sendEmail(email, subject, html);
//   await prisma.otp.upsert({
//     where: {
//       email: email,
//     },
//     update: { otp: otp, expiresAt: new Date(expiresAt) },
//     create: { email: email, otp: otp, expiresAt: new Date(expiresAt) },
//   });

//   return otp;
// };

// const verifyForgotPasswordOtpCodeDB = async (payload: any) => {
//   const { email, otp } = payload;

//   if (!email && !otp) {
//     throw new ApiError(400, "Email and OTP are required.");
//   }

//   const user = await prisma.user.findFirst({ where: { email: email } });
//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   const verifyData = await prisma.otp.findUnique({
//     where: {
//       email: email,
//     },
//   });

//   if (!verifyData) {
//     throw new ApiError(400, "Invalid or expired OTP.");
//   }

//   const { otp: savedOtp, expiresAt } = verifyData;

//   if (otp !== savedOtp) {
//     throw new ApiError(401, "Invalid OTP.");
//   }

//   if (Date.now() > expiresAt.getTime()) {
//     await prisma.otp.delete({
//       where: {
//         email: email,
//       },
//     }); // OTP has expired
//     throw new ApiError(410, "OTP has expired. Please request a new OTP.");
//   }

//   // OTP is valid
//   await prisma.otp.delete({
//     where: {
//       email: email,
//     },
//   });

//   const accessToken = jwtHelpers.generateToken(
//     { id: user.id, email },
//     config.jwt.jwt_secret as string,
//     config.jwt.expires_in as string,
//   );

//   return { accessToken: accessToken };
// };

// reset password
