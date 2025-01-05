import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Not Found</h2>
      <Button asChild className="px-4 py-2 rounded ">
        <Link href={"/"}>Back To Home Page</Link>
      </Button>
    </div>
  );
};

export default NotFound;
