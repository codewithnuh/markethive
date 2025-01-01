"use server";

import { z } from "zod";
import { db } from "@/lib/database/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
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
    role: string;
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
        role:
          validatedData.data.email === "footballhdlm@gmail.com"
            ? "ADMIN"
            : "CUSTOMER",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
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

// Validation schemas
const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

// Types
type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type UserResponse = {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

/**
 * Get user data
 */
export async function getUser(): Promise<UserResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: Please sign in",
      };
    }

    const user = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: "Failed to fetch user data",
    };
  }
}

/**
 * Update user data
 */

export async function updateUser(
  input: UpdateUserInput
): Promise<UserResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: Please sign in",
      };
    }

    // Validate input
    const validatedData = updateUserSchema.safeParse(input);
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.errors[0]?.message || "Invalid input",
      };
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if email is taken by another user
    if (validatedData.data.email !== existingUser.email) {
      const emailTaken = await db.user.findFirst({
        where: {
          email: validatedData.data.email,
          NOT: {
            clerkId: userId,
          },
        },
      });

      if (emailTaken) {
        return {
          success: false,
          error: "Email is already taken",
        };
      }
    }

    // Update user
    const updatedUser = await db.user.update({
      where: {
        clerkId: userId,
      },
      data: validatedData.data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // Revalidate cached data
    revalidatePath("/profile");

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: "Failed to update user data",
    };
  }
}

/**
 * Delete user
 */
export async function deleteUserData(
  clerkId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if the user exists
    const user = await db.user.findUnique({
      where: {
        clerkId,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Delete user-related data in the correct order
    await db.$transaction([
      // Delete cart items associated with the user
      db.cartItem.deleteMany({
        where: {
          cart: {
            userId: clerkId,
          },
        },
      }),

      // Delete carts associated with the user
      db.cart.deleteMany({
        where: {
          userId: clerkId,
        },
      }),

      // Delete order items associated with the user
      db.orderItem.deleteMany({
        where: {
          order: {
            userId: clerkId,
          },
        },
      }),

      // Delete orders associated with the user
      db.order.deleteMany({
        where: {
          userId: clerkId,
        },
      }),

      // Finally, delete the user itself
      db.user.delete({
        where: {
          clerkId,
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error deleting user data:", error);
    return { success: false, error: "Failed to delete user data" };
  }
}

export async function deleteClerkAccount(clerkId: string) {
  try {
    const client = await clerkClient();
    await client.users.deleteUser(clerkId);
    return {
      success: true,
      message: "User account deleted",
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      success: false,
      message: "User account not deleted",
    };
  }
}

// lib/actions/user/actions.ts

// For webhook-triggered updates
export async function updateUserFromWebhook(
  clerkId: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
  }
): Promise<UserResponse> {
  try {
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: {
        clerkId: clerkId,
      },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if email is taken by another user
    if (data.email !== existingUser.email) {
      const emailTaken = await db.user.findFirst({
        where: {
          email: data.email,
          NOT: {
            clerkId: clerkId,
          },
        },
      });

      if (emailTaken) {
        return {
          success: false,
          error: "Email is already taken",
        };
      }
    }

    // Update user
    const updatedUser = await db.user.update({
      where: {
        clerkId: clerkId,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user from webhook:", error);
    return {
      success: false,
      error: "Failed to update user data",
    };
  }
}

/**
 * Get all users
 */
export async function getAllUsers() {
  try {
    // Ensure the environment variable is loaded
    const excludedClerkId = process.env.AUTH_ID;

    // Fetch all users except the one with the excluded clerkId
    const users = await db.user.findMany({
      where: {
        clerkId: {
          not: excludedClerkId, // Exclude the specified clerkId
        },
      },
      select: {
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: "Failed to fetch users",
    };
  }
}
