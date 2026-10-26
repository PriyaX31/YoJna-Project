import React from "react";
import { BarLoader } from "@/components/loader";

export default function MainLoading() {
  return (
    <div className="w-full space-y-6">
      <BarLoader width="100%" color="#3b82f6" className="mb-4" />
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-44 rounded-xl border border-border/40 bg-card/60 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-muted rounded" />
                  <div className="h-3 w-14 bg-muted/60 rounded" />
                </div>
              </div>
              <div className="h-10 w-full bg-muted/40 rounded" />
              <div className="h-4 w-24 bg-muted/30 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
