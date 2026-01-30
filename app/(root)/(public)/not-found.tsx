import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-8 animate-in fade-in zoom-in duration-700">
      <div className="space-y-2">
        <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-secondary">404</h1>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Page not found</h2>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
           The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Button asChild size="lg" className="rounded-full px-8 bg-blue-600 hover:bg-blue-700">
        <Link href="/">Back To Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
