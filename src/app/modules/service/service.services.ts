import { Request } from "express";
import { uploadInSpace } from "../../../shared/UploadHelper";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { TServiceCategory, TServiceType } from "@prisma/client";
import { generateNanoLink } from "../../../helpers/generateLink";

const createNewServiceInDB = async (req: Request) => {
  const providerId = req.user?.id as string;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
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

  const processImages = async (
    files: Express.Multer.File[] | undefined,
    folder: string,
  ) => {
    if (!files || files.length === 0) return null;
    return Promise.all(
      files.map((file) => uploadInSpace(file, `courses/${folder}`)),
    );
  };

  const [url1, url2, url3, url4, url5] = await Promise.all([
    processImages(files?.url1, "url1"),
    processImages(files?.url2, "url2"),
    processImages(files?.url3, "url3"),
    processImages(files?.url4, "url4"),
    processImages(files?.url5, "url5"),
  ]);

  if (!url1) {
    throw new ApiError(400, "First image is required for a service");
  }

  const servicePrice = parseFloat(payload.servicePrice);
  const totalProvider = parseInt(payload.totalProvider);

  const link = generateNanoLink();

  await prisma.service.create({
    data: {
      providerId,
      serviceName: payload.serviceName,
      description: payload.description,
      duration: payload.duration,
      endTime: payload.endTime,
      startTime: payload.startTime,
      serviceMode: payload.serviceMode,
      notes: payload.notes,
      url1: url1 ? url1[0] : null,
      url2: url2 ? url2[0] : null,
      url3: url3 ? url3[0] : null,
      url4: url4 ? url4[0] : null,
      url5: url5 ? url5[0] : null,
      useServiceHours: payload.useServiceHours,
      useWorkingHours: payload.useWorkingHours,
      workingDays: payload.workingDays,
      status: payload.status || "Active",
      serviceCategory: payload.serviceCategory,
      servicePrice: servicePrice,
      totalProvider: totalProvider,
      link: link,
    },
  });

  return;
};

const getAllServicesFrom = async (
  userId: string,
  search?: string,
  type?: TServiceType,
  gender?: TServiceCategory,
  city?: string,
  region?: string,
) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const where: any = {
    status: "Active",
  };

  if (gender) {
    where.serviceCategory = gender;
  }

  if (search) {
    where.serviceName = { contains: search, mode: "insensitive" };
  }

  // Build provider filter only if needed
  if (type || city || region) {
    where.provider = {
      providerProfiles: {
        some: {
          ...(type && { serviceType: type }),
          ...(city && { city: { contains: city, mode: "insensitive" } }),
          ...(region && { region: { contains: region, mode: "insensitive" } }),
        },
      },
    };
  }

  const services = await prisma.service.findMany({
    where,
    select: {
      id: true,
      url1: true,
      serviceName: true,
      servicePrice: true,
      provider: {
        select: {
          id: true,
          avgRating: true,
          providerProfiles: {
            select: {
              city: true,
              serviceType: true,
            },
          },
        },
      },
      favourites: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  return services;
};
const getAllServicesFromDBGuestMode = async (
  search?: string,
  type?: TServiceType,
  gender?: TServiceCategory,
  city?: string,
  region?: string,
) => {
  const where: any = {
    status: "Active",
  };

  if (gender) {
    where.serviceCategory = gender;
  }

  if (search) {
    where.serviceName = { contains: search, mode: "insensitive" };
  }

  // Build provider filter only if needed
  if (type || city || region) {
    where.provider = {
      providerProfiles: {
        some: {
          ...(type && { serviceType: type }),
          ...(city && { city: { contains: city, mode: "insensitive" } }),
          ...(region && { region: { contains: region, mode: "insensitive" } }),
        },
      },
    };
  }

  const services = await prisma.service.findMany({
    where,
    select: {
      id: true,
      url1: true,
      serviceName: true,
      servicePrice: true,
      provider: {
        select: {
          id: true,
          avgRating: true,
          providerProfiles: {
            select: {
              city: true,
              serviceType: true,
            },
          },
        },
      },
    },
  });

  return services;
};

const getProviderWiseServices = async (providerId: string) => {
  const deactivatedServices = await prisma.service.findMany({
    where: { providerId, status: "Deactivated" },
    select: {
      id: true,
      serviceName: true,
      duration: true,
      url1: true,
      totalProvider: true,
      servicePrice: true,
    },
  });
  const activeServices = await prisma.service.findMany({
    where: { providerId, status: "Active" },
    select: {
      id: true,
      serviceName: true,
      duration: true,
      url1: true,
      totalProvider: true,
      servicePrice: true,
    },
  });

  const savedServices = await prisma.savedService.findMany({
    where: { providerId },
    select: {
      id: true,
      serviceName: true,
      duration: true,
      totalProvider: true,
      servicePrice: true,
      url1: true,
      endTime: true,
      startTime: true,
      serviceMode: true,
    },
  });

  return { activeServices, deactivatedServices, savedServices };
};

const getSingleServiceFromDB = async (
  serviceId: string,
  gender: TServiceCategory,
) => {
  const serviceDetails = await prisma.service.findUniqueOrThrow({
    where: { id: serviceId },
    select: {
      id: true,
      serviceName: true,
      url1: true,
      servicePrice: true,
      description: true,
      link: true,
      provider: {
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
            },
          },
        },
      },
    },
  });
  const sevices = await prisma.service.findMany({
    where: {
      providerId: serviceDetails.provider.id,
      status: "Active",
      serviceCategory: gender ? { equals: gender } : undefined,
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
    },
  });

  const offers = await prisma.offer.findMany({
    where: { providerId: serviceDetails.provider.id, status: "Active" },
    select: {
      id: true,
      serviceName: true,
      mediaUrl: true,
      servicePrice: true,
    },
  });

  // const reviews = [
  //   {
  //     id: "69a2d08143a1f7eddf10328a",
  //     rating: 5,
  //     comment: "Excellent service!",
  //     createdAt: "2026-02-28T11:24:49.502+00:00",
  //     user: {
  //       id: "user123",
  //       fullName: "John Doe",
  //       profileImage: "123-456-7890",
  //     },
  //   },
  // ];

  const reviews = await prisma.review.findMany({
    where: { serviceId },
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
    serviceDetails,
    sevices,
    offers,
    reviews,
  };
};

const getServiceDetailsFromDB = async (serviceId: string) => {
  const serviceDetails = await prisma.service.findUniqueOrThrow({
    where: { id: serviceId },
  });
  return serviceDetails;
};

const updateServiceInDB = async (req: Request) => {
  const payload = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const service = await prisma.service.findUniqueOrThrow({
    where: { id: payload.serviceId },
  });

  const processImages = async (
    files: Express.Multer.File[] | undefined,
    folder: string,
  ) => {
    if (!files || files.length === 0) return null;
    return Promise.all(
      files.map((file) => uploadInSpace(file, `courses/${folder}`)),
    );
  };

  const [url1, url2, url3, url4, url5] = await Promise.all([
    processImages(files?.url1, "url1"),
    processImages(files?.url2, "url2"),
    processImages(files?.url3, "url3"),
    processImages(files?.url4, "url4"),
    processImages(files?.url5, "url5"),
  ]);

  await prisma.service.update({
    where: { id: payload.serviceId },
    data: {
      serviceName: payload.serviceName ?? service.serviceName,
      description: payload.description ?? service.description,
      duration: payload.duration ?? service.duration,
      endTime: payload.endTime ?? service.endTime,
      startTime: payload.startTime ?? service.startTime,
      serviceMode: payload.serviceMode ?? service.serviceMode,
      notes: payload.notes ?? service.notes,
      url1: url1 ? url1[0] : service.url1,
      url2: url2 ? url2[0] : service.url2,
      url3: url3 ? url3[0] : service.url3,
      url4: url4 ? url4[0] : service.url4,
      url5: url5 ? url5[0] : service.url5,
      useServiceHours: payload.useServiceHours ?? service.useServiceHours,
      useWorkingHours: payload.useWorkingHours ?? service.useWorkingHours,
      workingDays: payload.workingDays ?? service.workingDays,
      serviceCategory: payload.serviceCategory ?? service.serviceCategory,
      servicePrice: payload.servicePrice
        ? parseFloat(payload.servicePrice)
        : service.servicePrice,
      totalProvider: payload.totalProvider
        ? parseInt(payload.totalProvider)
        : service.totalProvider,
      providerName: payload.providerName ?? service.providerName,
    },
  });

  return;
};

const toggleActiveDeactiveServiceInDB = async (serviceId: string) => {
  const service = await prisma.service.findUniqueOrThrow({
    where: { id: serviceId },
  });

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      status: service.status === "Active" ? "Deactivated" : "Active",
    },
  });

  return {
    message: `Service has been ${service.status === "Active" ? "deactivated" : "activated"} successfully`,
  };
};

const deleteServiceFromDB = async (serviceId: string) => {
  await prisma.service.delete({
    where: { id: serviceId },
  });
  return;
};

const toggleFavoriteServiceInDB = async (serviceId: string, userId: string) => {
  await prisma.service.findUniqueOrThrow({
    where: { id: serviceId },
  });

  const isFavorite = await prisma.favourite.findFirst({
    where: { userId, serviceId },
  });

  if (isFavorite) {
    await prisma.favourite.delete({
      where: { id: isFavorite.id },
    });
    return { message: "Service removed from favorites" };
  } else {
    await prisma.favourite.create({
      data: { userId, serviceId },
    });
    return { message: "Service added to favorites" };
  }
};

const getFavouriteServicesFromDB = async (userId: string) => {
  const favourites = await prisma.favourite.findMany({
    where: { userId },
    select: {
      id: true,
      service: {
        select: {
          id: true,
          serviceName: true,
          url1: true,
          servicePrice: true,
          provider: {
            select: {
              id: true,
              avgRating: true,
              fullName: true,
              totalReview: true,
            },
          },
        },
      },
    },
  });

  return favourites;
};

const createNewServiceByAdminInDB = async (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const payload = req.body;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: payload.providerId, role: "Provider" },
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

  const processImages = async (
    files: Express.Multer.File[] | undefined,
    folder: string,
  ) => {
    if (!files || files.length === 0) return null;
    return Promise.all(
      files.map((file) => uploadInSpace(file, `courses/${folder}`)),
    );
  };

  const [url1, url2, url3, url4, url5] = await Promise.all([
    processImages(files?.url1, "url1"),
    processImages(files?.url2, "url2"),
    processImages(files?.url3, "url3"),
    processImages(files?.url4, "url4"),
    processImages(files?.url5, "url5"),
  ]);

  if (!url1) {
    throw new ApiError(400, "First image is required for a service");
  }

  const servicePrice = parseFloat(payload.servicePrice);
  const totalProvider = parseInt(payload.totalProvider);

  const link = generateNanoLink();

  await prisma.service.create({
    data: {
      providerId: payload.providerId,
      serviceName: payload.serviceName,
      description: payload.description,
      duration: payload.duration,
      endTime: payload.endTime,
      startTime: payload.startTime,
      serviceMode: payload.serviceMode,
      notes: payload.notes,
      url1: url1 ? url1[0] : null,
      url2: url2 ? url2[0] : null,
      url3: url3 ? url3[0] : null,
      url4: url4 ? url4[0] : null,
      url5: url5 ? url5[0] : null,
      useServiceHours: payload.useServiceHours,
      useWorkingHours: payload.useWorkingHours,
      workingDays: payload.workingDays,
      status: payload.status || "Active",
      serviceCategory: payload.serviceCategory,
      servicePrice: servicePrice,
      totalProvider: totalProvider,
      link: link,
    },
  });

  return;
};

export const services = {
  createNewServiceInDB,
  getAllServicesFromDBGuestMode,
  getAllServicesFrom,
  getProviderWiseServices,
  getServiceDetailsFromDB,
  getSingleServiceFromDB,
  updateServiceInDB,
  toggleActiveDeactiveServiceInDB,
  deleteServiceFromDB,
  toggleFavoriteServiceInDB,
  getFavouriteServicesFromDB,
  createNewServiceByAdminInDB,
};
