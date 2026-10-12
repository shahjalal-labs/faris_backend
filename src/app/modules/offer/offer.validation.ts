import { z } from "zod";

const createOfferSchema = z.object({
  serviceName: z.string(),
  description: z.string(),
  serviceCategory: z.enum(["Male", "Female", "Both"]),
  startDate: z.string(),
  endDate: z.string(),
  location: z.enum(["Online", "Home"]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  useServiceHours: z.boolean(),
  useWorkingHours: z.boolean(),
});
const updateOfferSchema = z.object({
  serviceName: z.string().optional(),
  description: z.string().optional(),
  serviceCategory: z.enum(["Male", "Female", "Both"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.enum(["Online", "Home"]).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  useServiceHours: z.boolean().optional(),
  useWorkingHours: z.boolean().optional(),
  offerId: z.string(),
});

export const offerValidation = {
  createOfferSchema,
  updateOfferSchema,
};
