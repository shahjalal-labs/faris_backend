import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { services } from "./service.services";
import sendResponse from "../../../shared/sendResponse";
import { TServiceCategory, TServiceType } from "@prisma/client";

const createService = catchAsync(async (req: Request, res: Response) => {
  await services.createNewServiceInDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service created successfully",
  });
});
const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const gender = req.query.gender as TServiceCategory;
  const type = req.query.type as TServiceType;
  const city = req.query.city as string | undefined;
  const region = req.query.region as string | undefined;
  const servicesData = await services.getAllServicesFrom(
    req.user.id,
    search,
    type,
    gender,
    city,
    region,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All services retrieved successfully",
    data: servicesData,
  });
});
const getAllServicesGuestMode = catchAsync(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const gender = req.query.gender as TServiceCategory;
  const type = req.query.type as TServiceType;
  const city = req.query.city as string | undefined;
  const region = req.query.region as string | undefined;
  const servicesData = await services.getAllServicesFromDBGuestMode(
    search,
    type,
    gender,
    city,
    region,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All services retrieved successfully",
    data: servicesData,
  });
});
const singleService = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const gender = req.query.gender as TServiceCategory;

  const servicesData = await services.getSingleServiceFromDB(id, gender);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "service retrieved successfully",
    data: servicesData,
  });
});
const providerServices = catchAsync(async (req: Request, res: Response) => {
  const servicesData = await services.getProviderWiseServices(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Provider's services retrieved successfully",
    data: servicesData,
  });
});
const serviceDetails = catchAsync(async (req: Request, res: Response) => {
  const servicesData = await services.getServiceDetailsFromDB(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service details retrieved successfully",
    data: servicesData,
  });
});
const updateService = catchAsync(async (req: Request, res: Response) => {
  await services.updateServiceInDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service updated successfully",
  });
});
const toggleActiveDeactiveService = catchAsync(
  async (req: Request, res: Response) => {
    const result = await services.toggleActiveDeactiveServiceInDB(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
    });
  },
);
const deleteService = catchAsync(async (req: Request, res: Response) => {
  await services.deleteServiceFromDB(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service deleted successfully",
  });
});
const toggleFavoriteService = catchAsync(async (req: Request, res: Response) => {
  const result = await services.toggleFavoriteServiceInDB(
    req.params.id,
    req.user.id,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});
const getFavouriteServices = catchAsync(async (req: Request, res: Response) => {
  const result = await services.getFavouriteServicesFromDB(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Favourite services retrieved successfully",
    data: result,
  });
});

const createServiceByAdmin = catchAsync(async (req: Request, res: Response) => {
  await services.createNewServiceByAdminInDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service created successfully",
  });
});

export const serviceController = {
  createService,
  providerServices,
  serviceDetails,
  updateService,
  toggleActiveDeactiveService,
  deleteService,
  getAllServicesGuestMode,
  singleService,
  toggleFavoriteService,
  getAllServices,
  getFavouriteServices,
  createServiceByAdmin,
};
