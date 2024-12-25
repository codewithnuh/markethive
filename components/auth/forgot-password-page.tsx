"use client";

import React from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ResetPasswordState = {
  email: string;
  password: string;
  code: string;
};

type ErrorState = {
  message: string;
  field?: keyof ResetPasswordState;
};

const ForgotPassword = () => {
  const [formState, setFormState] = React.useState<ResetPasswordState>({
    email: "",
    password: "",
    code: "",
  });

  const [successfulCreation, setSuccessfulCreation] = React.useState(false);
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const [secondFactor, setSecondFactor] = React.useState(false);
  const [error, setError] = React.useState<ErrorState | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn } = useSignIn();

  React.useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  // Redirect after successful reset
  React.useEffect(() => {
    if (resetSuccess) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [resetSuccess, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error?.field === name) {
      setError(null);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setIsLoading(true);
    setError(null);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: formState.email,
      });
      setSuccessfulCreation(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError({
        message: err.errors?.[0]?.longMessage ?? "Failed to send reset code",
        field: "email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || resetSuccess) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: formState.code,
        password: formState.password,
      });

      if (result.status === "needs_second_factor") {
        setSecondFactor(true);
      } else if (result.status === "complete") {
        setResetSuccess(true);
        // Don't immediately set active session - let user sign in again
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError({
        message: err.errors?.[0]?.longMessage ?? "Failed to reset password",
        field: err.errors?.[0]?.meta?.paramName as keyof ResetPasswordState,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Forgot Password?</CardTitle>
        <CardDescription>
          {resetSuccess
            ? "Password reset successful! Redirecting to sign in..."
            : !successfulCreation
            ? "Enter your email to receive a password reset code."
            : "Enter your new password and the reset code sent to your email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={
            !successfulCreation ? handleSendResetCode : handleResetPassword
          }
          className="space-y-4"
        >
          {!successfulCreation ? (
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="e.g john@doe.com"
                value={formState.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className={cn(
                  error?.field === "email" &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleInputChange}
                  disabled={isLoading || resetSuccess}
                  className={cn(
                    error?.field === "password" &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Reset Code</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  value={formState.code}
                  onChange={handleInputChange}
                  disabled={isLoading || resetSuccess}
                  className={cn(
                    error?.field === "code" &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                  placeholder="Enter the code sent to your email"
                />
              </div>
            </>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || resetSuccess}
          >
            {resetSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Password Reset Successful
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                {!successfulCreation
                  ? "Sending reset code..."
                  : "Resetting password..."}
              </>
            ) : !successfulCreation ? (
              "Send password reset code"
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        {secondFactor && (
          <Alert className="w-full">
            <AlertDescription>
              2FA is required, but this UI does not handle that
            </AlertDescription>
          </Alert>
        )}
        {resetSuccess && (
          <Alert className="w-full bg-green-50 border-green-200 text-green-800">
            <AlertDescription className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Password reset successful! Redirecting to /.
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
};

export default ForgotPassword;
