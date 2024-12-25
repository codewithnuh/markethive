"use client";

import { useState } from "react";
import { updatePassword } from "@/lib/actions/user/actions";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function PasswordForm() {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = await updatePassword(formData);
    setMessage(result.message);
    e.target.reset();
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
        <Button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Password
        </Button>
      </div>

      {message && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          {message}
        </p>
      )}
    </form>
  );
}
