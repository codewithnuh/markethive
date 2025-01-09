"use client";

import React, { useState } from "react";
import { loginUser } from "@/lib/actions/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string[];
  password?: string[];
  general?: string[];
}
interface ActionResult {
  success: boolean;
  message?: string;
  errors?: FormErrors;
}

export default function LoginForm() {
  const router = useRouter();
  const [localFormData, setLocalFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [actionResult, setActionResult] = useState<ActionResult>({
    success: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FormData
  ) => {
    setLocalFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear specific field errors when user starts typing
    if (actionResult.errors) {
      const newErrors = { ...actionResult.errors };
      delete newErrors[field];
      setActionResult((prev) => ({ ...prev, errors: newErrors }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionResult({ success: false });

    const formData = new FormData();
    formData.append("email", localFormData.email);
    formData.append("password", localFormData.password);

    try {
      const result = await loginUser(formData);
      setActionResult(result);

      if (result.success) {
        router.push("/admin");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setActionResult({
        success: false,
        errors: {
          general: ["An unexpected error occurred. Please try again."],
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            {` Don't have an account yet? `}
            <Link
              href="/admin/sign-up"
              className="text-primary hover:underline font-medium"
            >
              Sign up here
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Field */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={localFormData.email}
              onChange={(e) => handleInputChange(e, "email")}
              aria-invalid={!!actionResult.errors?.email}
            />
            {actionResult.errors?.email && (
              <div className="text-red-500 text-sm mt-1">
                {actionResult.errors.email.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              value={localFormData.password}
              onChange={(e) => handleInputChange(e, "password")}
              aria-invalid={!!actionResult.errors?.password}
            />
            {actionResult.errors?.password && (
              <div className="text-red-500 text-sm mt-1">
                {actionResult.errors.password.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          {/* General Error Message */}
          {actionResult.errors?.general && (
            <div className="text-red-500 text-sm mt-2">
              {actionResult.errors.general.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging In..." : "Log In"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
