"use client";

import React, { useState } from "react";
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  // if (!isLoaded) {
  //   return null;
  // }

  if (isSignedIn) {
    router.push("/");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await signIn
      ?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      .then((_) => {
        setSuccessfulCreation(true);
        setError("");
      })
      .catch((err) => {
        console.error("error", err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      });
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    await signIn
      ?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      })
      .then((result) => {
        if (result.status === "needs_second_factor") {
          setSecondFactor(true);
          setError("");
        } else if (result.status === "complete") {
          setActive({ session: result.createdSessionId });
          setError("");
        } else {
          console.log(result);
        }
      })
      .catch((err) => {
        console.error("error", err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password?</CardTitle>
        <CardDescription>
          {!successfulCreation
            ? "Enter your email to receive a password reset code."
            : "Enter your new password and the reset code sent to your email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={!successfulCreation ? create : reset}
          className="space-y-4"
        >
          {!successfulCreation ? (
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g john@doe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Reset Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter the code sent to your email"
                />
              </div>
            </>
          )}
          <Button type="submit" className="w-full">
            {!successfulCreation
              ? "Send password reset code"
              : "Reset Password"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {secondFactor && (
          <Alert>
            <AlertDescription>
              2FA is required, but this UI does not handle that
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
};

export default ForgotPassword;
