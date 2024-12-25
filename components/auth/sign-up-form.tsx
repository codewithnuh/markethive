"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

function SubmitButton({
  text,
  isLoading,
}: {
  text: string;
  isLoading: boolean;
}) {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? "Submitting..." : text}
    </Button>
  );
}

export default function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState(""); // To store error messages
  const [isLoading, setIsLoading] = React.useState(false); // To handle loading state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError(""); // Reset any previous errors

    if (!isLoaded) {
      setError("Authentication service is not loaded. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message || "An unexpected error occurred.";
      setError(errorMessage); // Display error message
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError(""); // Reset any previous errors

    if (!isLoaded) {
      setError("Authentication service is not loaded. Please try again.");
      console.log(isLoaded);
      setIsLoading(false);
      return;
    }

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.push("/");
      } else {
        setError("Verification failed. Please check the code and try again.");
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message || "An unexpected error occurred.";
      setError(errorMessage); // Display error message
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  if (verifying) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Verify your email
          </CardTitle>
          <CardDescription>
            Enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <form onSubmit={handleVerify} className="space-y-4">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
            {/* Error Message */}
            <SubmitButton text="Verify" isLoading={isLoading} />
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
        <CardDescription>
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-primary hover:underline font-medium"
          >
            Sign in here
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button variant="outline" className="w-full">
            <svg
              className="w-4 h-4 mr-2"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Sign up with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  required
                />
                {error && !emailAddress && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  required
                />
                {error && !password && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </div>
              {/* CAPTCHA Widget */}
              <div id="clerk-captcha"></div>
              {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
              {/* General Error */}
              <SubmitButton text="Sign up" isLoading={isLoading} />
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
