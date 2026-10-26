"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {error?.message || "An unexpected server error occurred. Please try again or return home."}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => reset()} variant="default" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
