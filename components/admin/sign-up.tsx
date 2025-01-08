"use client";

import React, { useState, useMemo } from "react";
import { registerUser } from "@/lib/actions/auth/actions";
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
// Password strength calculation utility
function calculatePasswordStrength(password: string) {
  // Strength criteria
  const criteria = [
    {
      test: (p: string) => p.length >= 8,
      message: "At least 8 characters long",
    },
    {
      test: (p: string) => /[A-Z]/.test(p),
      message: "Contains uppercase letter",
    },
    {
      test: (p: string) => /[a-z]/.test(p),
      message: "Contains lowercase letter",
    },
    {
      test: (p: string) => /[0-9]/.test(p),
      message: "Contains a number",
    },
    {
      test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
      message: "Contains a special character",
    },
  ];

  // Calculate strength
  const passedCriteria = criteria.filter((c) => c.test(password));

  let strength = 0;
  let status: "weak" | "medium" | "strong" = "weak";

  if (passedCriteria.length === 0) {
    strength = 0;
    status = "weak";
  } else if (passedCriteria.length <= 2) {
    strength = 25 * passedCriteria.length;
    status = "weak";
  } else if (passedCriteria.length <= 4) {
    strength = 25 * passedCriteria.length;
    status = "medium";
  } else {
    strength = 100;
    status = "strong";
  }

  return {
    strength,
    status,
    failedCriteria: criteria.filter((c) => !c.test(password)),
    passedCriteria,
  };
}

// Color mapping for strength
const strengthColors = {
  weak: "bg-red-500",
  medium: "bg-yellow-500",
  strong: "bg-green-500",
};

export default function SignupForm() {
  const router = useRouter();

  const [localFormData, setLocalFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [submissionState, setSubmissionState] = useState<{
    success: boolean;
    errors?: {
      name?: string[];
      email?: string[];
      password?: string[];
      general?: string[];
    };
  }>({
    success: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(localFormData.password),
    [localFormData.password]
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof localFormData
  ) => {
    setLocalFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear specific field errors when user starts typing
    if (submissionState.errors) {
      const newErrors = { ...submissionState.errors };
      delete newErrors[field];
      setSubmissionState((prev) => ({ ...prev, errors: newErrors }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionState({ success: false });

    const formData = new FormData();
    Object.entries(localFormData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const result = await registerUser(formData);

      setSubmissionState(result);

      if (result.success) {
        router.push("/dashboard");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSubmissionState({
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
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create an account to get started.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Name Field */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={localFormData.name}
                onChange={(e) => handleInputChange(e, "name")}
                aria-invalid={!!submissionState.errors?.name}
                disabled={isSubmitting}
              />
              {submissionState.errors?.name && (
                <div className="text-red-500 text-sm mt-1">
                  {submissionState.errors.name.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>

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
                aria-invalid={!!submissionState.errors?.email}
                disabled={isSubmitting}
              />
              {submissionState.errors?.email && (
                <div className="text-red-500 text-sm mt-1">
                  {submissionState.errors.email.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Password Field with Strength Indicator */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                value={localFormData.password}
                onChange={(e) => handleInputChange(e, "password")}
                aria-invalid={!!submissionState.errors?.password}
                disabled={isSubmitting}
              />

              {/* Password Strength Indicator */}
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    strengthColors[passwordStrength.status]
                  } w-[${passwordStrength.strength}%]`}
                />
              </div>

              {/* Password Requirements */}
              <div className="mt-2 text-sm">
                <p className="text-gray-600">Password must:</p>
                <ul className="list-disc pl-5 text-xs text-gray-500">
                  <li
                    className={
                      passwordStrength.passedCriteria.some(
                        (c) => c.message === "At least 8 characters long"
                      )
                        ? "text-green-600"
                        : ""
                    }
                  >
                    Be at least 8 characters long
                  </li>
                  <li
                    className={
                      passwordStrength.passedCriteria.some(
                        (c) => c.message === "Contains uppercase letter"
                      )
                        ? "text-green-600"
                        : ""
                    }
                  >
                    Contain an uppercase letter
                  </li>
                  <li
                    className={
                      passwordStrength.passedCriteria.some(
                        (c) => c.message === "Contains lowercase letter"
                      )
                        ? "text-green-600"
                        : ""
                    }
                  >
                    Contain a lowercase letter
                  </li>
                  <li
                    className={
                      passwordStrength.passedCriteria.some(
                        (c) => c.message === "Contains a number"
                      )
                        ? "text-green-600"
                        : ""
                    }
                  >
                    Contain a number
                  </li>
                  <li
                    className={
                      passwordStrength.passedCriteria.some(
                        (c) => c.message === "Contains a special character"
                      )
                        ? "text-green-600"
                        : ""
                    }
                  >
                    Contain a special character
                  </li>
                </ul>
              </div>

              {/* Specific Password Errors */}
              {submissionState.errors?.password && (
                <div className="text-red-500 text-sm mt-1">
                  {submissionState.errors.password.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            {/* General Error Message */}
            {submissionState.errors?.general && (
              <div className="text-red-500 text-sm mt-2">
                {submissionState.errors.general.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || passwordStrength.status === "weak"}
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
}
