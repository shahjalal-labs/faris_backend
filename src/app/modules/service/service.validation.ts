import { z } from "zod";

const ServiceCategoryEnum = z.enum(["Male", "Female", "Both"]);
const ServiceModeEnum = z.enum(["Online", "Home"]);

const createServiceValidationSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  providerName: z.string().optional(),
  serviceCategory: ServiceCategoryEnum,
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.string().min(1, "Duration is required"),
  serviceMode: ServiceModeEnum,
  useServiceHours: z.boolean(),
  useWorkingHours: z.boolean(),
  description: z.string().optional(),
  notes: z.string().optional(),

});
const updateServiceValidationSchema = z.object({
  serviceId: z.string(),
  serviceName: z.string().optional(),
  providerName: z.string().optional(),
  serviceCategory: ServiceCategoryEnum.optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.string().optional(),
  serviceMode: ServiceModeEnum.optional(),
  description: z.string().optional(),
  notes: z.string().optional(),

});

export const serviceValidation = {
  createServiceValidationSchema,
  updateServiceValidationSchema
};
