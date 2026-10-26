"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sprintSchema } from "@/lib/validators";
import { createSprint } from "@/actions/sprints";
import useFetch from "@/hooks/use-fetch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  CalendarRange,
  CalendarDays,
  Clock,
  Plus,
  X,
  Loader2,
  Sparkles,
  ChevronDown,
  Check,
  ArrowRight,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, addDays, differenceInDays } from "date-fns";

export default function SprintCreationForm({
  projectId,
  projectTitle,
  projectKey,
  sprintKey,
  onClose,
  onSuccess,
}) {
  const router = useRouter();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Initial sprint range: today -> 14 days later (standard 2-week sprint)
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 14),
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: `${projectKey || "PRJ"} Sprint ${sprintKey || 1}`,
      startDate: dateRange.from,
      endDate: dateRange.to,
    },
  });

  const {
    data: newSprint,
    loading: isSubmitting,
    fn: createSprintFn,
  } = useFetch(createSprint);

  useEffect(() => {
    if (newSprint) {
      toast.success(`Sprint "${newSprint.name}" created successfully!`);
      reset();
      router.refresh();
      if (onSuccess) {
        onSuccess(newSprint);
      }
      if (onClose) {
        onClose();
      }
    }
  }, [newSprint, router, onClose, onSuccess, reset]);

  // Duration Presets definitions
  const presets = [
    { label: "1 Week", days: 7, weeks: 1 },
    { label: "2 Weeks", days: 14, weeks: 2, recommended: true },
    { label: "3 Weeks", days: 21, weeks: 3 },
    { label: "4 Weeks", days: 28, weeks: 4 },
  ];

  // Set quick duration preset using date-fns addDays
  const setDurationPreset = (days) => {
    const start = dateRange?.from || new Date();
    const end = addDays(start, days);
    const newRange = { from: start, to: end };
    setDateRange(newRange);
    setValue("startDate", start, { shouldValidate: true });
    setValue("endDate", end, { shouldValidate: true });
  };

  // Handle DayPicker date range selection
  const handleRangeSelect = (range) => {
    setDateRange(range);
    if (range?.from) {
      setValue("startDate", range.from, { shouldValidate: true });
      if (range.to) {
        setValue("endDate", range.to, { shouldValidate: true });
      } else {
        // Automatically default end date to 14 days after start date
        const defaultEnd = addDays(range.from, 14);
        setValue("endDate", defaultEnd, { shouldValidate: true });
      }
    }
  };

  // Calculate duration using date-fns differenceInDays
  const durationDays =
    dateRange?.from && dateRange?.to && dateRange.to >= dateRange.from
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0;

  const onSubmit = async (values) => {
    if (!values.startDate || !values.endDate) {
      toast.error("Please select a valid start and end date for the sprint");
      return;
    }

    await createSprintFn(projectId, {
      name: values.name.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
    });
  };

  return (
    <Card className="border border-border/80 bg-card/95 shadow-xl backdrop-blur-sm transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">
                Create New Sprint
              </CardTitle>
              <CardDescription className="text-xs">
                Plan an iteration for {projectTitle || "your project"} ({projectKey})
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-0">
          {/* Sprint Name Field */}
          <div className="space-y-1.5">
            <label htmlFor="sprint-name" className="text-xs font-semibold text-foreground">
              Sprint Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="sprint-name"
              type="text"
              placeholder="e.g. Sprint 1 - Core MVP"
              {...register("name")}
              className="h-9 bg-background/60 text-sm focus-visible:ring-primary"
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Quick Duration Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Sprint Duration
              </span>
              {durationDays > 0 && (
                <span className="text-[11px] font-mono text-primary font-semibold flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {durationDays} days ({Math.round(durationDays / 7)} weeks)
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((preset) => {
                const isActive = durationDays === preset.days;
                return (
                  <Button
                    key={preset.days}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDurationPreset(preset.days)}
                    className={`h-8 text-xs justify-center relative font-medium transition-all ${
                      isActive
                        ? "shadow-sm ring-1 ring-primary/40 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border-border/70"
                    }`}
                  >
                    <span>{preset.label}</span>
                    {preset.recommended && (
                      <span
                        className={`ml-1 text-[9px] uppercase px-1 py-0.5 rounded font-semibold tracking-wider ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        Rec
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Date Picker using React Day Picker & Date-Fns */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                Sprint Schedule (Start & End Date) <span className="text-destructive">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                Click cards to open calendar
              </span>
            </div>

            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setIsCalendarOpen((prev) => !prev);
                    }
                  }}
                  className="w-full cursor-pointer text-left group transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                >
                  {/* Visual Timeline Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-border/70 bg-background/50 hover:bg-background/80 hover:border-primary/40 transition-colors">
                    {/* Start Date Card */}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-card/60">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                          Sprint Kickoff
                        </span>
                        <span className="text-sm font-semibold text-foreground truncate block">
                          {dateRange?.from
                            ? format(dateRange.from, "EEE, MMM d, yyyy")
                            : "Pick start date"}
                        </span>
                      </div>
                    </div>

                    {/* End Date Card */}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-card/60">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <CalendarRange className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                          Sprint Review & Retro
                        </span>
                        <span className="text-sm font-semibold text-foreground truncate block">
                          {dateRange?.to
                            ? format(dateRange.to, "EEE, MMM d, yyyy")
                            : dateRange?.from
                            ? `Ends ~ ${format(addDays(dateRange.from, 14), "EEE, MMM d, yyyy")}`
                            : "Pick end date"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverTrigger>

              <PopoverContent
                className="w-auto p-4 shadow-2xl border-border/80 bg-card/95 backdrop-blur-md rounded-2xl"
                align="start"
              >
                {/* Popover Header */}
                <div className="pb-3 mb-2 border-b border-border/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      Select Sprint Date Range
                    </span>
                  </div>
                  {durationDays > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[11px] font-mono border-primary/30 text-primary bg-primary/10 px-2 py-0.5"
                    >
                      {durationDays} Days ({Math.round(durationDays / 7)} Wk)
                    </Badge>
                  )}
                </div>

                {/* Quick Presets inside Popover */}
                <div className="flex items-center gap-1.5 mb-3">
                  {presets.map((preset) => {
                    const isActive = durationDays === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDurationPreset(preset.days);
                        }}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar DayPicker */}
                <div className="rounded-xl border border-border/40 p-2 bg-background/50">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={handleRangeSelect}
                    disabled={{ before: new Date() }}
                  />
                </div>

                {/* Popover Footer */}
                <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-xs gap-3">
                  <span className="text-muted-foreground font-mono text-[11px] truncate">
                    {dateRange?.from && dateRange?.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} &rarr; {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      "Click start date then end date"
                    )}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 px-3 text-xs gap-1 font-medium shrink-0"
                    onClick={() => setIsCalendarOpen(false)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Apply Dates
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {(errors.startDate || errors.endDate) && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.startDate?.message || errors.endDate?.message || "Please select both start and end dates"}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-2.5 border-t border-border/40 bg-muted/20 px-6 py-3.5">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-9 gap-2 shadow-sm font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Sprint...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Create Sprint</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
