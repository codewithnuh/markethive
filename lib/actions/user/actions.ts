"use server";

import { z } from "zod";
import { db } from "@/lib/database/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Validation schema
const userSchema = z.object({
  clerkId: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().optional(),
});

// Types
type UserInput = z.infer<typeof userSchema>;

type AddUserResponse = {
  success?: boolean;
  error?: string;
  data?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export async function addUser(input: UserInput): Promise<AddUserResponse> {
  try {
    // // Get authenticated user's ID
    // const { userId } = await auth();
    // if (!userId) {
    //   return {
    //     success: false,
    //     error: "Unauthorized: Please sign in",
    //   };
    // }

    // Validate input
    const validatedData = userSchema.safeParse(input);
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.errors[0]?.message || "Invalid input",
      };
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: validatedData.data.email }],
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "User already exists",
      };
    }

    // Create new user
    const newUser = await db.user.create({
      // Need to wrap the data in a 'data' object
      data: {
        ...validatedData.data,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/profile");

    return {
      success: true,
      data: newUser,
    };
  } catch (error) {
    console.error("Error adding user:", error);

    if (error instanceof Error && error.message.includes("unique constraint")) {
      return {
        success: false,
        error: "This email is already registered",
      };
    }

    return {
      success: false,
      error: "Failed to add user. Please try again.",
    };
  }
}

// Example usage in a Client Component:
/*
'use client';

import { addUser } from "@/app/actions/add-user";

export default function UserForm() {
  async function handleSubmit(formData: FormData) {
    const userData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
    };

    const result = await addUser(userData);

    if (!result.success) {
      // Handle error (e.g., show toast message)
      console.error(result.error);
      return;
    }

    // Handle success
    console.log('User added:', result.data);
  }

  return (
    <form action={handleSubmit}>
      ...form fields...
    </form>
  );
}
*/
