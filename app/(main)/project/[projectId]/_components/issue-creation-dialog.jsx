"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { issueSchema } from "@/lib/validators";
import { createIssue } from "@/actions/issues";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

export default function IssueCreationDialog({
  isOpen,
  onClose,
  projectId,
  sprintId,
  defaultStatus = "TODO",
  orgUsers = [],
  onIssueCreated,
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      status: defaultStatus,
      assigneeId: "",
      sprintId: sprintId || null,
    },
  });

  // Keep default status and sprint updated when dialog opens
  useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: defaultStatus,
        assigneeId: "",
        sprintId: sprintId || null,
      });
    }
  }, [isOpen, defaultStatus, sprintId, reset]);

  const {
    data: newIssue,
    loading: isSubmitting,
    fn: createIssueFn,
  } = useFetch(createIssue);

  useEffect(() => {
    if (newIssue) {
      toast.success(`Issue "${newIssue.title}" created successfully!`);
      reset();
      if (onIssueCreated) {
        onIssueCreated(newIssue);
      }
      onClose();
    }
  }, [newIssue, reset, onIssueCreated, onClose]);

  const onSubmit = async (values) => {
    await createIssueFn(projectId, {
      ...values,
      sprintId: sprintId || null,
      assigneeId: values.assigneeId === "unassigned" ? null : values.assigneeId || null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/80">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Create Issue</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a task, story, or bug to the sprint backlog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="issue-title" className="text-xs font-semibold text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="issue-title"
              placeholder="e.g. Implement user authentication"
              {...register("title")}
              className="h-9 bg-background/60 text-sm focus-visible:ring-primary"
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="issue-desc" className="text-xs font-semibold text-foreground">
              Description
            </label>
            <Textarea
              id="issue-desc"
              rows={3}
              placeholder="Add details, acceptance criteria, or notes..."
              {...register("description")}
              className="resize-none bg-background/60 text-sm focus-visible:ring-primary"
            />
            {errors.description && (
              <p className="text-xs text-destructive font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Status & Priority Row with shadcn UI Select */}
          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9 w-full bg-background/60 font-medium text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="IN_REVIEW">In Review</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Priority</label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9 w-full bg-background/60 font-medium text-xs">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Assignee Row with shadcn UI Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Assignee</label>
            <Controller
              control={control}
              name="assigneeId"
              render={({ field }) => (
                <Select
                  value={field.value || "unassigned"}
                  onValueChange={(val) => field.onChange(val === "unassigned" ? "" : val)}
                >
                  <SelectTrigger className="h-9 w-full bg-background/60 text-xs">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {orgUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs gap-1.5 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Issue</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
