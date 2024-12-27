/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, FormEvent, useEffect } from "react";
import { UserResponse } from "@/lib/actions/user/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DeleteAccountModal from "./delete-user-modal";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
  userData: UserResponse["data"];
}

interface FormInputs {
  firstName: string;
  lastName: string;
}

export default function ProfileForm({ userData }: ProfileFormProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [formData, setFormData] = useState<FormInputs>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) throw new Error("No user found");

      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      await user.reload();

      toast({
        title: "Profile Updated",
        description: `Name updated to ${formData.firstName} ${formData.lastName}`,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const result = await user?.delete();

      if (result) {
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted.",
          variant: "destructive",
        });
        router.push("/");
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name Input */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                disabled={isSubmitting}
              />
            </div>

            {/* Last Name Input */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>

          {/* Delete Account Button */}
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isSubmitting}
          >
            Delete Account
          </Button>
        </CardFooter>
      </form>

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </Card>
  );
}
