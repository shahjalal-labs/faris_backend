import { z } from "zod";
const receiverEnum = z.enum(["AllUsers", "Users", "Providers", "SingleUser"]);

const faqValiationSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),

});

const cancelReasonValidationSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});


const adminNotificationSchema = z.object({
  receiver: receiverEnum,
  content: z.string().min(1, "Content is required"),
  userId: z.string().optional().nullable(),
});

export const adminValidation = {
  faqValiationSchema,
  cancelReasonValidationSchema,
  adminNotificationSchema
};
