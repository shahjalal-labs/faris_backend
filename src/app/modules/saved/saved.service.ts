import { Request } from "express";
import { uploadInSpace } from "../../../shared/UploadHelper";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { generateNanoLink } from "../../../helpers/generateLink";

const createSavedServiceInDB = async (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const payload = req.body;
  const providerId = req.user?.id as string;

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

  await prisma.savedService.create({
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
      serviceCategory: payload.serviceCategory,
      servicePrice: parseFloat(payload.servicePrice),
      providerName: payload.providerName,
      totalProvider: parseInt(payload.totalProvider),
      link: generateNanoLink(),
      useServiceHours: payload.useServiceHours,
      useWorkingHours: payload.useWorkingHours,
      workingDays: payload.workingDays,
    },
  });

  return;
};

const getSavedServicesByProviderId = async (providerId: string) => {
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
  return savedServices;
};

const getSavedServiceById = async (id: string) => {
  const savedService = await prisma.savedService.findUniqueOrThrow({
    where: { id },
  });

  return savedService;
};

const updateSavedServiceInDB = async (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const payload = req.body;

  const service = await prisma.savedService.findUniqueOrThrow({
    where: { id: payload.serviceId },
  });

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

  await prisma.savedService.update({
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
      serviceCategory: payload.serviceCategory ?? service.serviceCategory,
      servicePrice: parseFloat(payload.servicePrice) ?? service.servicePrice,
      providerName: payload.providerName ?? service.providerName,
      totalProvider: parseInt(payload.totalProvider) ?? service.totalProvider,
      useServiceHours: payload.useServiceHours ?? service.useServiceHours,
      useWorkingHours: payload.useWorkingHours ?? service.useWorkingHours,
      workingDays: payload.workingDays ?? service.workingDays,
    },
  });

  return;
};

const deleteSavedServiceInDB = async (id: string) => {
  const service = await prisma.savedService.findUnique({
    where: { id },
  });
  if (!service) {
    throw new ApiError(404, "Saved service not found");
  }
  await prisma.savedService.delete({
    where: { id },
  });
  return;
};

export const savedServices = {
  createSavedServiceInDB,
  getSavedServicesByProviderId,
  getSavedServiceById,
  updateSavedServiceInDB,
  deleteSavedServiceInDB,
};
