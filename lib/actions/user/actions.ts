"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";

type ProfileData = {
  firstName: string;
  lastName: string;
};

export async function updateProfile(formData: FormData) {
  // In a real application, you would update the user's profile in your database
  // This is a mock implementation
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Revalidate the profile page
  revalidatePath("/profile");

  return { success: true, message: "Profile updated successfully" };
}

export async function updatePassword(formData: FormData) {
  // In a real application, you would update the user's password in your database
  // This is a mock implementation
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  // Simulate API call and password validation
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Revalidate the profile page
  revalidatePath("/profile");

  return { success: true, message: "Password updated successfully" };
}

export async function uploadProfileImage(formData: FormData) {
  // In a real application, you would upload the image to a storage service
  // and update the user's profile with the new image URL
  // This is a mock implementation
  const file = formData.get("profileImage") as File;

  if (!file) {
    return { success: false, message: "No file uploaded" };
  }

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Revalidate the profile page
  revalidatePath("/profile");

  return { success: true, message: "Profile image updated successfully" };
}

export async function getUserData(): Promise<
  ProfileData & { email: string; profileImageUrl: string }
> {
  // In a real application, you would fetch this data from your database
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    profileImageUrl: "/placeholder.svg?height=200&width=200",
  };
}
export async function getUserInfo() {
  const { userId } = await auth();
  const user = await currentUser();
  return user;
}
