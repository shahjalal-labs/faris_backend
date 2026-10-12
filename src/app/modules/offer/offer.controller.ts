import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { offerService } from "./offer.service";
import sendResponse from "../../../shared/sendResponse";

const createOffer = catchAsync(async (req: Request, res: Response) => {
  await offerService.createNewOfferInDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Offer created successfully",
  });
});
const providerWiseOffers = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user.id;
  const offers = await offerService.getProviderWiseOffers(providerId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Provider wise offers retrieved successfully",
    data: offers,
  });
});
const allActiveOffers = catchAsync(async (req: Request, res: Response) => {
  const offers = await offerService.getAllOffersFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All active offers retrieved successfully",
    data: offers,
  });
});
const offerDetails = catchAsync(async (req: Request, res: Response) => {
  const offerId = req.params.id;
  const offer = await offerService.getOfferDetailsById(offerId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Offer details retrieved successfully",
    data: offer,
  });
});
const getOfferForAdminUpdate = catchAsync(async (req: Request, res: Response) => {
  const offerId = req.params.id;
  const offer = await offerService.getOfferForAdminUpdate(offerId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Offer details retrieved successfully",
    data: offer,
  });
});
const updateOffer = catchAsync(async (req: Request, res: Response) => {
  await offerService.updateOfferInDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Offer updated successfully",
  });
});

const createOfferByAdmin = catchAsync(async (req: Request, res: Response) => {
  await offerService.createNewOfferByAdminInDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Offer created successfully",
  });
});

export const offerController = {
  createOffer,
  providerWiseOffers,
  offerDetails,
  updateOffer,
  allActiveOffers,
  createOfferByAdmin,
  getOfferForAdminUpdate,
};
