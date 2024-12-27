"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs"; // Import Clerk's user hook
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function PasswordForm() {
  const [message, setMessage] = useState(""); // For success/error messages
  const [error, setError] = useState(""); // For error messages
  const { isLoaded, user } = useUser(); // Access the current authenticated user

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Extract form data
    const formData = new FormData(e.target as HTMLFormElement);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!isLoaded || !user) {
      setError("User is not authenticated.");
      return;
    }

    try {
      // Update the password using Clerk's SDK
      await user.updatePassword({
        currentPassword, // Optional: include currentPassword if your app requires it
        newPassword: newPassword,
      });

      setMessage("Password updated successfully!");
      setError("");
      e.currentTarget.reset(); // Reset the form
    } catch (err) {
      console.error("Failed to update password:", err);
      setError(
        "Failed to update password. Please ensure your current password is correct and try again."
      );
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Current Password
          </Label>
          <Input
            type="password"
            name="currentPassword"
            id="currentPassword"
            required
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <Label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            New Password
          </Label>
          <Input
            type="password"
            name="newPassword"
            id="newPassword"
            required
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-5">
        <Button type="submit">Update Password</Button>
      </div>

      {message && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
