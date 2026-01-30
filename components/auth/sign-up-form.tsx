/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useSignUp, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { OAuthStrategy } from "@clerk/types";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

type SignUpState = {
  emailAddress: string;
  password: string;
  firstName: string;
  lastName: string;
};

interface SubmitButtonProps {
  text: string;
  isLoading: boolean;
}

function SubmitButton({ text, isLoading }: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        text
      )}
    </Button>
  );
}

export default function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();
  const [formState, setFormState] = React.useState<SignUpState>({
    emailAddress: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [verifying, setVerifying] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = React.useState(false);
  const router = useRouter();

  const handleOAuthSignIn = async (strategy: OAuthStrategy) => {
    if (!signIn || !signUp) return;

    try {
      setIsOAuthLoading(true);
      setError("");

      const userExistsButNeedsToSignIn =
        signUp.verifications.externalAccount.status === "transferable" &&
        signUp.verifications.externalAccount.error?.code ===
          "external_account_exists";

      if (userExistsButNeedsToSignIn) {
        const res = await signIn.create({ transfer: true });
        if (res.status === "complete") {
          await setActive({ session: res.createdSessionId });
          router.push("/");
          return;
        }
      }

      const userNeedsToBeCreated =
        signIn?.firstFactorVerification.status === "transferable";
      if (userNeedsToBeCreated) {
        const res = await signUp.create({ transfer: true });
        if (res.status === "complete") {
          await setActive({ session: res.createdSessionId });
          router.push("/");
          return;
        }
      }

      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to sign in with Google");
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!isLoaded) {
      setError("Authentication service is not loaded. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      await signUp.create({
        emailAddress: formState.emailAddress,
        password: formState.password,
        firstName: formState.firstName,
        lastName: formState.lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!isLoaded) {
      setError("Authentication service is not loaded. Please try again.");
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
      setError(err.errors?.[0]?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <SubmitButton text="Verify" isLoading={isLoading} />
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Create account</h1>
        <p className="text-muted-foreground">Join the MarketHive community</p>
      </div>

      <Card className="rounded-[2rem] border-none shadow-xl shadow-black/5 p-4">
        <CardContent className="pt-6 space-y-6">
          <Button
            variant="outline"
            className="w-full h-12 rounded-full border-2 hover:bg-secondary/50 font-bold"
            onClick={() => handleOAuthSignIn("oauth_google")}
            disabled={isOAuthLoading}
          >
            {isOAuthLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  />
                </svg>
                Sign up with Google
              </div>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
              <span className="bg-white dark:bg-card px-4 text-muted-foreground">
                Or email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-widest ml-1">First name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className="h-12 rounded-xl bg-secondary/30 border-none px-4"
                  value={formState.firstName}
                  onChange={(e) => setFormState(p => ({ ...p, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-widest ml-1">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="h-12 rounded-xl bg-secondary/30 border-none px-4"
                  value={formState.lastName}
                  onChange={(e) => setFormState(p => ({ ...p, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="h-12 rounded-xl bg-secondary/30 border-none px-4"
                value={formState.emailAddress}
                onChange={(e) => setFormState(p => ({ ...p, emailAddress: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" title="Password" className="text-xs font-bold uppercase tracking-widest ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                className="h-12 rounded-xl bg-secondary/30 border-none px-4"
                value={formState.password}
                onChange={(e) => setFormState(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-600/20" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-blue-600 font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
