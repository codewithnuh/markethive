import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(8, "Password should be at least 8 characters"),
});
// Define the structure of the session payload
export interface SessionPayload {
  userId: string; // Unique user identifier
  isAdmin: boolean; // Is the user an admin?
  expiresAt: string; // Expiration time of the session
  [key: string]: string | boolean;
}

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
