"use server";
import bcrypt from "bcrypt";
import { db } from "@/lib/database/db";
import { z } from "zod";
import { createSession, deleteSession } from "@/lib/auth/session";
import { verifySession } from "@/lib/dal";

// Define validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Login action
export async function loginUser(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  errors?: { [key: string]: string[] };
}> {
  const rawFormData = {
    email: formData.get("email") as string | null,
    password: formData.get("password") as string | null,
  };

  const validationResult = loginSchema.safeParse(rawFormData);
  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validationResult.data;

  try {
    const admin = await db.admin.findUnique({ where: { email } });
    if (!admin) {
      return { success: false, errors: { email: ["User not found"] } };
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return { success: false, errors: { password: ["Invalid password"] } };
    }

    const isAdmin = true; // Assuming `role` column in database
    await createSession(admin.id, isAdmin);

    return { success: true, message: "Login successful!" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, errors: { general: ["An error occurred"] } };
  }
}

/**
 * Validation schema for user registration
 * Enforces requirements for name, email and password fields
 */
const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" }),

  email: z
    .string()
    .email({ message: "Invalid email address" })
    .max(100, { message: "Email cannot exceed 100 characters" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[!@#$%^&*()]/, {
      message: "Password must contain at least one special character",
    }),
});

/**
 * Interface defining the structure of the registration action result
 * @property success - Indicates if registration was successful
 * @property message - Optional success message
 * @property errors - Optional validation/registration errors by field
 */
interface ActionResult {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
}

/**
 * Handles user registration process
 * @param formData - Form data containing user registration details
 * @returns Promise<ActionResult> - Result of registration attempt
 */
export async function registerUser(formData: FormData): Promise<ActionResult> {
  const rawFormData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validationResult = registerSchema.safeParse(rawFormData);
  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    // Check if an admin already exists in the database
    const existingAdmin = await db.admin.findFirst();
    if (existingAdmin) {
      return {
        success: false,
        errors: { email: ["Admin already exists. Registration is disabled."] },
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(
      validationResult.data.password,
      10
    );

    // Create the admin user
    const user = await db.admin.create({
      data: {
        name: validationResult.data.name,
        email: validationResult.data.email,
        password: hashedPassword,
      },
    });

    // Create a session for the admin
    await createSession(user.id, true);

    return { success: true, message: "Admin registered successfully!" };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      errors: { email: ["Failed to register. Please try again."] },
    };
  }
}

export async function isSessionExists() {
  const session = await verifySession();
  if (session) return { success: true };
  return {
    success: false,
  };
}
export async function logout() {
  await deleteSession();
}
