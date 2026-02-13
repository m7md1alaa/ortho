import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@convex/validation";
import { z } from "zod";

/**
 * Shared password validation schema
 * This is the single source of truth for password requirements
 * Used by both frontend forms and backend validation
 */
export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  )
  .max(
    MAX_PASSWORD_LENGTH,
    `Password must be less than ${MAX_PASSWORD_LENGTH} characters`
  );

/**
 * Sign up form schema - uses shared password validation
 */
export const signUpSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: passwordSchema,
});

/**
 * Sign in form schema
 */
export const signInSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
