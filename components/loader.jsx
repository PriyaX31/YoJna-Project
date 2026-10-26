import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * BarLoader - Indeterminate horizontal progress bar.
 * Matches react-spinners BarLoader API for seamless compatibility.
 *
 * @param {string|number} width - e.g. "100%", "200px" (default: "100%")
 * @param {string|number} height - e.g. 4, "4px" (default: 4)
 * @param {string} color - Bar fill color hex or CSS color (default: "#3b82f6" / primary)
 * @param {string} className - Additional Tailwind CSS classes
 */
export function BarLoader({
  width = "100%",
  height = 4,
  color = "#3b82f6",
  className,
  style = {},
  ...props
}) {
  const widthVal = typeof width === "number" ? `${width}px` : width;
  const heightVal = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      role="progressbar"
      aria-label="Loading content..."
      className={cn(
        "relative overflow-hidden rounded-full bg-primary/10 dark:bg-primary/20",
        className
      )}
      style={{
        width: widthVal,
        height: heightVal,
        ...style,
      }}
      {...props}
    >
      <div
        className="absolute top-0 bottom-0 animate-bar-loader rounded-full"
        style={{
          backgroundColor: color,
        }}
      />
    </div>
  );
}

/**
 * Circular Spinner loader with optional text.
 */
export function Spinner({ size = "md", text, className }) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-4", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size] || sizeMap.md)} />
      {text && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * Skeleton loader for Project Kanban / Issues Board.
 * Perfect for server-side rendered streaming and Next.js loading.jsx.
 */
export function IssueBoardSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Top project header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted/70 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 bg-muted rounded-md" />
          <div className="h-9 w-32 bg-primary/20 rounded-md" />
        </div>
      </div>

      {/* Sprints / Filters skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-40 bg-muted rounded-md" />
        <div className="h-9 w-24 bg-muted rounded-md" />
      </div>

      {/* Kanban Board Columns skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {["To Do", "In Progress", "In Review", "Done"].map((col, index) => (
          <div
            key={index}
            className="flex flex-col rounded-xl border border-border/60 bg-muted/20 p-4 min-h-[420px]"
          >
            {/* Column header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {col}
              </span>
              <div className="h-5 w-6 rounded-full bg-muted" />
            </div>

            {/* Skeleton issue cards */}
            <div className="space-y-3">
              {[1, 2, 3].slice(0, 3 - index % 2).map((card) => (
                <div
                  key={card}
                  className="rounded-lg border border-border/40 bg-card p-3 shadow-sm space-y-2.5"
                >
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted/60 rounded" />
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <div className="h-4 w-12 bg-muted/80 rounded" />
                    <div className="h-5 w-5 rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Default export: Versatile Loader component for full-page or section loading.
 */
export default function Loader({
  text = "Loading...",
  fullScreen = false,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center p-6",
        fullScreen ? "min-h-[70vh] w-full" : "w-full py-12",
        className
      )}
    >
      <BarLoader width={220} height={4} className="mb-2" />
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>{text}</span>
      </div>
    </div>
  );
}
