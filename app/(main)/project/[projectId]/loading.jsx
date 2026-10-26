import React from "react";
import { BarLoader, IssueBoardSkeleton } from "@/components/loader";

export default function ProjectLoading() {
  return (
    <div className="w-full space-y-6">
      <BarLoader width="100%" color="#36b7b7" className="mb-4" />
      <IssueBoardSkeleton />
    </div>
  );
}
