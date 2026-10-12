import { z } from "zod";

const updateLocationValidationSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Latitude must be ≥ -90")
    .max(90, "Latitude must be ≤ 90"),

  longitude: z
    .number()
    .min(-180, "Longitude must be ≥ -180")
    .max(180, "Longitude must be ≤ 180"),
});

export const ServiceCategoryEnum = z.enum(["Male", "Female", "Both"]);
export const ServiceTypeEnum = z.enum([
  "Salon",
  "Aesthetic",
  "Grooming",
  "Spa",
]);
export const ServiceModeEnum = z.enum(["Online", "Home"]);

/** Main Provider Profile Schema */
export const providerProfileSchema = z.object({
  region: z.string(),
  city: z.string(),
  serviceCategory: ServiceCategoryEnum,
  serviceType: ServiceTypeEnum,
  salonDescription: z.string(),
  optionalNote: z.string().optional(),
  nidNote: z.string().optional(),
  additionalNote: z.string().optional(),
  additionalPhoto: z.string().optional(),
});

export const providerProfileUpdateSchema = z.object({
  region: z.string().optional(),
  city: z.string().optional(),
  serviceCategory: ServiceCategoryEnum.optional(),
  serviceType: ServiceTypeEnum.optional(),
  salonDescription: z.string().optional(),
  optionalNote: z.string().optional(),
  nidNote: z.string().optional(),
  additionalNote: z.string().optional(),
  additionalPhoto: z.string().optional(),
});

export const authValidation = {
  updateLocationValidationSchema,
  providerProfileSchema,
  providerProfileUpdateSchema,
};
