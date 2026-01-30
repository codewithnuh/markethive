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
    <Card className="w-full max-w-md mx-auto rounded-[2rem] border-none shadow-2xl p-4">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold tracking-tight">Forgot password?</CardTitle>
        <CardDescription className="text-sm">
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
          className="space-y-6"
        >
          {!successfulCreation ? (
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest ml-1">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formState.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className={cn(
                  "h-12 rounded-xl bg-secondary/30 border-none px-4",
                  error?.field === "email" && "ring-2 ring-red-500"
                )}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <Label htmlFor="password" title="New Password" className="text-xs font-bold uppercase tracking-widest ml-1">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleInputChange}
                  disabled={isLoading || resetSuccess}
                  className={cn(
                    "h-12 rounded-xl bg-secondary/30 border-none px-4",
                    error?.field === "password" && "ring-2 ring-red-500"
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="code" title="Reset Code" className="text-xs font-bold uppercase tracking-widest ml-1">Reset Code</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  value={formState.code}
                  onChange={handleInputChange}
                  disabled={isLoading || resetSuccess}
                  className={cn(
                    "h-12 rounded-xl bg-secondary/30 border-none px-4",
                    error?.field === "code" && "ring-2 ring-red-500"
                  )}
                  placeholder="6-digit code"
                />
              </div>
            </div>
          )}
          <Button
            type="submit"
            className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-600/20"
            disabled={isLoading || resetSuccess}
          >
            {resetSuccess ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : !successfulCreation ? (
              "Send code"
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-xl text-center w-full">
            {error.message}
          </div>
        )}
        {resetSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold p-3 rounded-xl text-center w-full flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Success! Redirecting...
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ForgotPassword;
