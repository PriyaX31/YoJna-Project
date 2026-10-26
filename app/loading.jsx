import React from "react";
import { BarLoader } from "@/components/loader";

export default function Loading() {
  return (
    <div className="w-full">
      <BarLoader width="100%" color="#3b82f6" className="fixed top-0 left-0 z-50 rounded-none h-1" />
      <div className="container mx-auto py-24 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading workspace...
        </p>
      </div>
    </div>
  );
}
