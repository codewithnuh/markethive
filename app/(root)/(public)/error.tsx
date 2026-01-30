"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center space-y-8 animate-in fade-in duration-700">
       <div className="bg-red-500/10 p-6 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
       </div>
      <div className="space-y-2">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Something went wrong</h2>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
           An unexpected error occurred. We&apos;ve been notified and are looking into it.
        </p>
      </div>
      <div className="flex gap-4">
        <Button size="lg" className="rounded-full px-8 bg-blue-600 hover:bg-blue-700" onClick={() => reset()}>
          Try again
        </Button>
        <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
          <Link href="/">Back To Home</Link>
        </Button>
      </div>
    </div>
  );
}
