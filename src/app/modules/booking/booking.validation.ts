import { z } from "zod";

const acceptRejectValidationSchema = z.object({
  bookingId: z.string(),
  isAccepted: z.boolean(),
});
const cancelValidationSchema = z.object({
  bookingId: z.string(),
  cancelReason: z.string(),
});
const reviewValidationSchema = z.object({ 
  bookingId: z.string(), 
  rating: z.number().min(1).max(5),
  comment: z.string(),
});

export const bookingValidation = {
  acceptRejectValidationSchema,
  cancelValidationSchema,
  reviewValidationSchema
};