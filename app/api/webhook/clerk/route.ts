import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  addUser,
  deleteUser,
  updateUserFromWebhook,
} from "@/lib/actions/user/actions";
import { z } from "zod";

// Webhook configuration type
type WebhookConfig = {
  "svix-id": string;
  "svix-timestamp": string;
  "svix-signature": string;
};

// User data validation schema
const userSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
});

export async function POST(req: Request) {
  try {
    // Validate webhook secret
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error("WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Extract and validate headers
    const headerPayload = headers();
    const svixHeaders = {
      "svix-id": (await headerPayload).get("svix-id"),
      "svix-timestamp": (await headerPayload).get("svix-timestamp"),
      "svix-signature": (await headerPayload).get("svix-signature"),
    } as WebhookConfig;

    // Validate required headers
    if (
      !svixHeaders["svix-id"] ||
      !svixHeaders["svix-timestamp"] ||
      !svixHeaders["svix-signature"]
    ) {
      console.error("Missing required Svix headers");
      return NextResponse.json(
        { error: "Missing required headers" },
        { status: 400 }
      );
    }

    // Get and validate request body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Initialize webhook verifier
    const wh = new Webhook(WEBHOOK_SECRET);

    // Verify webhook signature
    let evt: WebhookEvent;
    try {
      evt = wh.verify(body, svixHeaders) as WebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return NextResponse.json(
        { error: "Webhook verification failed" },
        { status: 400 }
      );
    }

    // Handle user creation event
    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;

      // Validate email exists
      if (!email_addresses?.[0]?.email_address) {
        return NextResponse.json(
          { error: "No email address provided" },
          { status: 400 }
        );
      }

      // Prepare user data
      const userData = {
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name ?? "",
        lastName: last_name ?? "",
      };

      // Validate user data
      const validatedData = userSchema.safeParse(userData);
      if (!validatedData.success) {
        console.error("Invalid user data:", validatedData.error);
        return NextResponse.json(
          { error: "Invalid user data", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      try {
        // Create new user
        const newUser = await addUser(validatedData.data);

        // Return success response with user data
        return NextResponse.json(
          {
            message: "User created successfully",
            user: newUser,
          },
          { status: 201 }
        );
      } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
    }
    // In your webhook route handler
    if (evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name } = evt.data;

      // Validate email exists
      if (!email_addresses?.[0]?.email_address) {
        return NextResponse.json(
          { error: "No email address provided" },
          { status: 400 }
        );
      }

      // Prepare user data
      const userData = {
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        email: email_addresses[0].email_address,
      };

      // Validate user data
      const validatedData = userSchema.safeParse({
        ...userData,
        clerkId: id,
      });

      if (!validatedData.success) {
        console.error("Invalid user data:", validatedData.error);
        return NextResponse.json(
          { error: "Invalid user data", details: validatedData.error.errors },
          { status: 400 }
        );
      }

      try {
        // Use the webhook-specific update function
        const updatedUser = await updateUserFromWebhook(id, userData);

        if (!updatedUser.success) {
          return NextResponse.json(
            { error: updatedUser.error },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            message: "User updated successfully",
            user: updatedUser.data,
          },
          { status: 200 }
        );
      } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 }
        );
      }
    }

    //Handle deletion of user
    if (evt.type === "user.deleted") {
      const { id } = evt.data;
      try {
        // Delete user
        const deletedUser = await deleteUser(id as string);
        // Return success response with user data
        return NextResponse.json(
          {
            message: "User deleted successfully",
            user: deletedUser,
          },
          { status: 201 }
        );
      } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
          { error: "Failed to delete user" },
          { status: 500 }
        );
      }
    }
    // Return OK for other event types
    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Global error handler
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
