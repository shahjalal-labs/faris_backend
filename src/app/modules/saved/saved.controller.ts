import { Request, Response } from "express";
import { savedServices } from "./saved.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

const createSavedService = catchAsync(async (req: Request, res: Response) => {
  await savedServices.createSavedServiceInDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service saved successfully",
  });
});
const updateSavedService = catchAsync(async (req: Request, res: Response) => {
  await savedServices.updateSavedServiceInDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service updated successfully",
  });
});
const deleteSavedService = catchAsync(async (req: Request, res: Response) => {
  await savedServices.deleteSavedServiceInDB(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service deleted successfully",
  });
});
const getProviderSavedServices = catchAsync(
  async (req: Request, res: Response) => {
    const providerId = req.user?.id as string;
    const result = await savedServices.getSavedServicesByProviderId(providerId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Saved services retrieved successfully",
      data: result,
    });
  },
);
const getSavedService = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await savedServices.getSavedServiceById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Saved service retrieved successfully",
    data: result,
  });
});

export const savedController = {
  createSavedService,
  updateSavedService,
  deleteSavedService,
  getProviderSavedServices,
  getSavedService,
};
