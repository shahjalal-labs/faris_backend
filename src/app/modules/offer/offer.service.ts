import { Request } from "express";
import prisma from "../../../shared/prisma";
import { uploadInSpace } from "../../../shared/UploadHelper";
import ApiError from "../../../errors/ApiErrors";
import { generateNanoLink } from "../../../helpers/generateLink";

const createNewOfferInDB = async (req: Request) => {
  const providerId = req.user?.id as string;
  const file = req.file;
  const payload = req.body;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: providerId, role: "Provider" },
  });

  if (user.status == "Pending")
    throw new ApiError(
      400,
      "Your account is under verification. You will be able to create services once your account is verified.",
    );

  if (payload.useServiceHours && payload.startTime && payload.endTime) {
    throw new ApiError(
      400,
      "Start time and end time are not required when using service hours",
    );
  }

  if (payload.useWorkingHours && payload.workingDays?.length > 0) {
    throw new ApiError(
      400,
      "Working days are not required when using working hours",
    );
  }

  if (payload.totalAvailableSlots < payload.maxBookingsPerHour) {
    throw new ApiError(
      400,
      "Total available slots cannot be less than maximum bookings per hour",
    );
  }

  if (!payload.useServiceHours && (!payload.startTime || !payload.endTime)) {
    throw new ApiError(
      400,
      "Start time and end time are required when not using service hours",
    );
  }

  if (!payload.useWorkingHours && payload.workingDays?.length === 0) {
    throw new ApiError(
      400,
      "Working days are required when not using working hours",
    );
  }

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const mediaUrl = file ? await processImage(file, "serviceImage") : null;

  if (!mediaUrl) {
    throw new ApiError(400, "Offer image is required.");
  }

  const offerPrice = parseFloat(payload.servicePrice);

  const link = generateNanoLink();

  await prisma.offer.create({
    data: {
      providerId,
      serviceName: payload.serviceName,
      description: payload.description,
      endTime: payload.endTime,
      startTime: payload.startTime,
      useServiceHours: payload.useServiceHours,
      workingDays: payload.workingDays,
      useWorkingHours: payload.useWorkingHours,
      endDate: payload.endDate,
      startDate: payload.startDate,
      location: payload.location,
      mediaUrl: mediaUrl,
      serviceCategory: payload.serviceCategory,
      servicePrice: offerPrice,
      link: link,
      maxBookingsPerHour: payload.maxBookingsPerHour,
      totalAvailableSlots: payload.totalAvailableSlots,
    },
  });

  await prisma.dashNotify.create({
    data: {
      title: `New Advertisement Posted`,
      content: `${user.fullName} has posted a new advertisement: ${payload.serviceName}. Please review the advertisement and take necessary actions.`,
      additionalDetails: "dsfsfsd",
    },
  });

  return;
};

const getProviderWiseOffers = async (providerId: string) => {
  const offers = await prisma.offer.findMany({
    where: { providerId },
    select: {
      id: true,
      serviceName: true,
      status: true,
      servicePrice: true,
      mediaUrl: true,
      maxBookingsPerHour: true,
      totalAvailableSlots: true,
      alreadyBooked: true,
    },
  });

  return offers;
};

const getAllOffersFromDB = async () => {
  const today = new Date().toISOString().split("T")[0];

  const offers = await prisma.offer.findMany({
    where: {
      status: "Active",
      endDate: {
        gte: today,
      },
    },
    orderBy: { createdAt: "desc" },
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

  return offers;
};

const getOfferDetailsById = async (offerId: string) => {
  const offer = await prisma.offer.findUniqueOrThrow({
    where: { id: offerId },
    include: {
      provider: {
        select: {
          fullName: true,
          providerProfiles: {
            select: {
              locationLink: true,
              region: true,
              city: true,
            },
          },
        },
      },
    },
  });

  return offer;
};

const updateOfferInDB = async (req: Request) => {
  const payload = req.body;
  const file = req.file;

  const offer = await prisma.offer.findUniqueOrThrow({
    where: { id: payload.offerId },
  });

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const mediaUrl = file ? await processImage(file, "serviceImage") : null;

  await prisma.offer.update({
    where: { id: payload.offerId },
    data: {
      serviceName: payload.serviceName ?? offer.serviceName,
      description: payload.description ?? offer.description,
      endTime: payload.endTime ?? offer.endTime,
      startTime: payload.startTime ?? offer.startTime,
      endDate: payload.endDate ?? offer.endDate,
      useServiceHours: payload.useServiceHours ?? offer.useServiceHours,
      workingDays: payload.workingDays ?? offer.workingDays,
      useWorkingHours: payload.useWorkingHours ?? offer.useWorkingHours,
      startDate: payload.startDate ?? offer.startDate,
      location: payload.location ?? offer.location,
      mediaUrl: mediaUrl ?? offer.mediaUrl,
      serviceCategory: payload.serviceCategory ?? offer.serviceCategory,
      totalAvailableSlots:
        payload.totalAvailableSlots ?? offer.totalAvailableSlots,
      maxBookingsPerHour:
        payload.maxBookingsPerHour ?? offer.maxBookingsPerHour,
      servicePrice: payload.servicePrice
        ? parseFloat(payload.servicePrice)
        : offer.servicePrice,
    },
  });

  return;
};

const createNewOfferByAdminInDB = async (req: Request) => {
  const file = req.file;
  const payload = req.body;

  await prisma.user.findUniqueOrThrow({
    where: { id: payload.providerId, role: "Provider" },
  });

  // if (user.status == "Pending")
  //   throw new ApiError(
  //     400,
  //     "Your account is under verification. You will be able to create services once your account is verified.",
  //   );

  if (payload.useServiceHours && payload.startTime && payload.endTime) {
    throw new ApiError(
      400,
      "Start time and end time are not required when using service hours",
    );
  }

  if (payload.useWorkingHours && payload.workingDays?.length > 0) {
    throw new ApiError(
      400,
      "Working days are not required when using working hours",
    );
  }

  if (!payload.useServiceHours && (!payload.startTime || !payload.endTime)) {
    throw new ApiError(
      400,
      "Start time and end time are required when not using service hours",
    );
  }

  if (!payload.useWorkingHours && payload.workingDays?.length === 0) {
    throw new ApiError(
      400,
      "Working days are required when not using working hours",
    );
  }

  const processImage = async (file: Express.Multer.File, folder: string) => {
    if (!file) return null;
    return uploadInSpace(file, `courses/${folder}`);
  };

  const mediaUrl = file ? await processImage(file, "serviceImage") : null;

  if (!mediaUrl) {
    throw new ApiError(400, "Offer image is required.");
  }

  const offerPrice = parseFloat(payload.servicePrice);

  const link = generateNanoLink();

  await prisma.offer.create({
    data: {
      providerId: payload.providerId,
      serviceName: payload.serviceName,
      description: payload.description,
      endTime: payload.endTime,
      startTime: payload.startTime,
      useServiceHours: payload.useServiceHours,
      workingDays: payload.workingDays,
      useWorkingHours: payload.useWorkingHours,
      endDate: payload.endDate,
      startDate: payload.startDate,
      location: payload.location,
      mediaUrl: mediaUrl,
      serviceCategory: payload.serviceCategory,
      servicePrice: offerPrice,
      link: link,
      maxBookingsPerHour: payload.maxBookingsPerHour,
      totalAvailableSlots: payload.totalAvailableSlots,
    },
  });

  return;
};

const getOfferForAdminUpdate = async (offerId: string) => {
  const offer = await prisma.offer.findUniqueOrThrow({
    where: { id: offerId },
  });

  return offer;
};

export const offerService = {
  createNewOfferInDB,
  createNewOfferByAdminInDB,
  getProviderWiseOffers,
  getOfferDetailsById,
  updateOfferInDB,
  getAllOffersFromDB,
  getOfferForAdminUpdate,
};
