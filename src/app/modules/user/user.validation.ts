import { z } from "zod";

const Gender = z.enum(["MALE", "FEMALE"], {
  required_error: "Gender is required",
  invalid_type_error: "Gender must be one of: MALE, FEMALE, OTHER",
});

const UserRole = z.enum(["Provider", "User"], {
  required_error: "Role is required",
  invalid_type_error: "Role must be either Provider or User",
});

const userRegisterValidationSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string(),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Enter a valid email address"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters long"),

  role: UserRole,
});
const userSignInValidationSchema = z.object({
  phoneNumber: z.string({
    required_error: "Phone number is required",
  }),
  otp: z.string({
    required_error: "OTP is required",
  }),
});
const userLoginValidationSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Enter a valid email address"),
  password: z.string({
    required_error: "Password is required",
  }),
});

const deleteAccountValidationSchema = z.object({
  password: z.string(),
});

export const userValidation = {
  userRegisterValidationSchema,
  userSignInValidationSchema,
  userLoginValidationSchema,
  deleteAccountValidationSchema,
};
