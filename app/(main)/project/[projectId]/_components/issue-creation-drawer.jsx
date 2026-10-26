"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { issueSchema } from "@/lib/validators";
import { createIssue } from "@/actions/issues";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Sparkles, CornerDownLeft } from "lucide-react";

export default function IssueCreationDrawer({
  isOpen,
  onClose,
  projectId,
  sprintId,
  defaultStatus = "TODO",
  orgUsers = [],
  onIssueCreated,
  onIssueFailed,
}) {
  const [createAnother, setCreateAnother] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setFocus,
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
      // Auto-focus title input when drawer opens
      setTimeout(() => setFocus("title"), 100);
    }
  }, [isOpen, defaultStatus, sprintId, reset, setFocus]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    // 1. Generate an instant optimistic issue
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const assigneeUser =
      values.assigneeId && values.assigneeId !== "unassigned"
        ? orgUsers.find((u) => u.id === values.assigneeId)
        : null;

    const optimisticIssue = {
      id: tempId,
      title: values.title.trim(),
      description: values.description ? values.description.trim() : null,
      priority: values.priority || "MEDIUM",
      status: values.status || defaultStatus,
      order: 9999, // Render at bottom of column
      projectId,
      sprintId: sprintId || null,
      assignee: assigneeUser || null,
      assigneeId: assigneeUser ? assigneeUser.id : null,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // 2. Instantly notify the Kanban board (0ms perceived latency!)
    if (onIssueCreated) {
      onIssueCreated(optimisticIssue);
    }

    // 3. Handle drawer state: close immediately or reset for next issue
    if (!createAnother) {
      onClose();
      reset();
    } else {
      // Keep drawer open for rapid bulk entry, clear title and description
      reset({
        ...values,
        title: "",
        description: "",
      });
      setFocus("title");
    }

    setIsSubmitting(false);

    // 4. Background Server Action: persist to database
    try {
      const persistedIssue = await createIssue(projectId, {
        ...values,
        sprintId: sprintId || null,
        assigneeId:
          values.assigneeId === "unassigned" ? null : values.assigneeId || null,
      });

      toast.success(`Issue "${persistedIssue.title}" created successfully!`);

      // 5. Replace optimistic placeholder with verified DB record
      if (onIssueCreated) {
        onIssueCreated(persistedIssue, tempId);
      }
    } catch (err) {
      console.error("Error creating issue:", err);
      toast.error(err.message || "Failed to create issue");

      // 6. Rollback optimistic issue from the board on failure
      if (onIssueFailed) {
        onIssueFailed(tempId);
      }
    }
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to submit instantly
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction="right"
    >
      <DrawerContent
        onKeyDown={handleKeyDown}
        className="sm:max-w-md w-full h-full bg-card border-l border-border/80 flex flex-col p-0 shadow-2xl"
      >
        <DrawerHeader className="p-5 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <DrawerTitle className="text-base font-bold">Create New Issue</DrawerTitle>
            </div>
            <DrawerDescription className="text-xs text-muted-foreground">
              Add a story, task, or bug to your sprint board.
            </DrawerDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="issue-title"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>
                  Title <span className="text-destructive">*</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-0.5">
                  <kbd className="px-1 py-0.2 rounded bg-muted text-[9px] border">Ctrl</kbd>+
                  <kbd className="px-1 py-0.2 rounded bg-muted text-[9px] border">Enter</kbd>
                </span>
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
                rows={4}
                placeholder="Add details, acceptance criteria, or context..."
                {...register("description")}
                className="resize-none bg-background/60 text-sm focus-visible:ring-primary"
              />
              {errors.description && (
                <p className="text-xs text-destructive font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Status & Priority Row */}
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
                      <SelectContent className="z-[100]" position="popper">
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
                      <SelectContent className="z-[100]" position="popper">
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

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Assignee</label>
              <Controller
                control={control}
                name="assigneeId"
                render={({ field }) => (
                  <Select
                    value={field.value || "unassigned"}
                    onValueChange={(val) =>
                      field.onChange(val === "unassigned" ? "" : val)
                    }
                  >
                    <SelectTrigger className="h-9 w-full bg-background/60 text-xs">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]" position="popper">
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {orgUsers && orgUsers.length > 0 ? (
                        orgUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))
                      ) : null}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DrawerFooter className="p-4 border-t border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-2">
            {/* Create Another Checkbox (Jira & Linear style) */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={createAnother}
                onChange={(e) => setCreateAnother(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span>Create another</span>
            </label>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8.5 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8.5 text-xs gap-1.5 font-medium shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Issue</span>
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
