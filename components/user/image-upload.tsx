"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadProfileImage } from "@/lib/actions/user/actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
    <Card className="bg-background/40  border sm:rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
          Update Profile Picture
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="shrink-0">
              <Avatar>
                <AvatarImage src={imageUrl} alt="Current profile photo" />
                <AvatarFallback>NUH</AvatarFallback>
              </Avatar>
            </div>
            <div className="w-full flex items-center justify-center md:w-auto  ">
              <Label className="sr-only">Choose profile photo</Label>
              <Input
                type="file"
                name="profileImage"
                className=" w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
            </div>
          </div>

          <div className="mt-4">
            <Button type="submit" className="w-full md:w-auto">
              Upload New Image
            </Button>
          </div>

          {message && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              {message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
