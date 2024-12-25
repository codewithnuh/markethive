"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadProfileImage } from "@/lib/actions/user/actions";

export default function ImageUploadForm({ initialImageUrl }) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = await uploadProfileImage(formData);
    setMessage(result.message);
    if (result.success) {
      // In a real application, you would get the new image URL from the server
      // For this example, we'll just use the same URL
      setImageUrl(`${initialImageUrl}?${new Date().getTime()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center space-x-6">
        <div className="shrink-0">
          <Image
            className="h-16 w-16 object-cover rounded-full"
            src={imageUrl}
            alt="Current profile photo"
            width={64}
            height={64}
          />
        </div>
        <label className="block">
          <span className="sr-only">Choose profile photo</span>
          <input
            type="file"
            name="profileImage"
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100
            "
          />
        </label>
      </div>
      <div className="mt-4">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Upload New Image
        </button>
      </div>
      {message && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          {message}
        </p>
      )}
    </form>
  );
}
