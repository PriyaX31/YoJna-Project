"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Play, CheckCircle2, Calendar, Sparkles, Loader2, X, Trash2 } from "lucide-react";
import SprintCreationForm from "./sprint-creation-form";
import SprintBoard from "./sprint-board";
import useFetch from "@/hooks/use-fetch";
import { updateSprintStatus, deleteSprint } from "@/actions/sprints";
import { toast } from "sonner";
import { isAfter, isBefore, formatDistanceToNow } from "date-fns";

/**
 * Returns color-coded badge based on sprint status and dates:
 * - If COMPLETED: returns "Sprint Ended"
 * - If ACTIVE & isAfter(now, endDate): returns "Overdue by [time]"
 * - If ACTIVE: returns "Active"
 * - If PLANNED & isBefore(now, startDate): returns "Starts in [time]"
 * - If PLANNED: returns "Planned"
 */
export function getSprintStatusBadge(sprint) {
  if (!sprint) return null;

  const now = new Date();
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);

  if (sprint.status === "COMPLETED") {
    return (
      <Badge variant="outline" className="bg-muted/40 text-muted-foreground border-border/80 font-medium">
        Sprint Ended
      </Badge>
    );
  }

  if (sprint.status === "ACTIVE") {
    if (isAfter(now, endDate)) {
      return (
        <Badge className="bg-red-500/15 text-red-500 hover:bg-red-500/20 border-red-500/30 font-medium">
          Overdue by {formatDistanceToNow(endDate)}
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/30 font-medium">
        Active
      </Badge>
    );
  }

  // PLANNED
  if (isBefore(now, startDate)) {
    return (
      <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 font-medium">
        Starts in {formatDistanceToNow(startDate)}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-medium">
      Planned
    </Badge>
  );
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function SprintManager({ project, sprints = [] }) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Default selected sprint: First active sprint, or the first sprint, or null
  const [selectedSprintId, setSelectedSprintId] = useState(() => {
    if (!sprints || sprints.length === 0) return null;
    const active = sprints.find((s) => s.status === "ACTIVE");
    return active ? active.id : sprints[0].id;
  });

  // Sync selected sprint when sprints change
  useEffect(() => {
    if (sprints && sprints.length > 0) {
      if (!selectedSprintId || !sprints.some((s) => s.id === selectedSprintId)) {
        const active = sprints.find((s) => s.status === "ACTIVE");
        setSelectedSprintId(active ? active.id : sprints[0].id);
      }
    } else {
      setSelectedSprintId(null);
    }
  }, [sprints, selectedSprintId]);

  const selectedSprint = sprints?.find((s) => s.id === selectedSprintId);

  const {
    data: updatedSprint,
    loading: statusUpdateLoading,
    fn: updateStatusFn,
  } = useFetch(updateSprintStatus);

  const {
    loading: isDeletingSprint,
    fn: deleteSprintFn,
  } = useFetch(deleteSprint);

  useEffect(() => {
    if (updatedSprint) {
      toast.success(
        `Sprint "${updatedSprint.name}" is now ${updatedSprint.status.toLowerCase()}!`
      );
      router.refresh();
    }
  }, [updatedSprint, router]);

  const handleStartSprint = async () => {
    if (!selectedSprint) return;
    await updateStatusFn(selectedSprint.id, "ACTIVE");
  };

  const handleCompleteSprint = async () => {
    if (!selectedSprint) return;
    if (
      window.confirm(
        `Are you sure you want to complete "${selectedSprint.name}"?`
      )
    ) {
      await updateStatusFn(selectedSprint.id, "COMPLETED");
    }
  };

  const handleDeleteSprint = async () => {
    if (!selectedSprint) return;
    if (
      window.confirm(
        `Are you sure you want to delete "${selectedSprint.name}"? Any assigned issues will be moved to the project backlog.`
      )
    ) {
      await deleteSprintFn(selectedSprint.id);
      toast.success(`Sprint "${selectedSprint.name}" deleted`);
      router.refresh();
    }
  };

  const nextSprintNumber = (sprints?.length || 0) + 1;

  return (
    <div className="w-full space-y-5">
      {/* Top Project Header with Create Sprint Button beside Project Name */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              {project.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-xs">
              {project.key}
            </span>

            {/* Create New Sprint Button placed directly beside project name on top left */}
            <Button
              size="sm"
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="h-8 gap-1.5 shadow-sm font-semibold text-xs ml-1"
              variant={showCreateForm ? "secondary" : "default"}
            >
              {showCreateForm ? (
                <>
                  <X className="h-3.5 w-3.5" />
                  <span>Close Form</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Sprint</span>
                </>
              )}
            </Button>
          </div>

          {project.description && (
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Expandable Sprint Creation Form */}
      {showCreateForm && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-200">
          <SprintCreationForm
            projectId={project.id}
            projectTitle={project.name}
            projectKey={project.key}
            sprintKey={nextSprintNumber}
            onClose={() => setShowCreateForm(false)}
            onSuccess={(created) => {
              setShowCreateForm(false);
              setSelectedSprintId(created.id);
            }}
          />
        </div>
      )}

      {/* Sprint Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs">
        {/* Left: Sprint Selector & Status */}
        <div className="flex flex-wrap items-center gap-3">
          {sprints && sprints.length > 0 ? (
            <>
              {/* Sprint Selector */}
              <div className="min-w-[200px] sm:min-w-[250px]">
                <Select
                  value={selectedSprintId || ""}
                  onValueChange={(val) => setSelectedSprintId(val)}
                >
                  <SelectTrigger className="h-9 font-medium">
                    <SelectValue placeholder="Select Sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {sprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        <div className="flex items-center justify-between gap-3 w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sprint.name}</span>
                            <span className="text-[11px] text-muted-foreground">
                              ({formatDate(sprint.startDate)} - {formatDate(sprint.endDate)})
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Badge & Date Range */}
              {selectedSprint && (
                <div className="flex items-center gap-2">
                  {getSprintStatusBadge(selectedSprint)}
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                    <Calendar className="h-3 w-3" />
                    {formatDate(selectedSprint.startDate)} &ndash; {formatDate(selectedSprint.endDate)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>No sprints yet</span>
            </div>
          )}
        </div>

        {/* Right Side: Sprint Lifecycle Actions */}
        <div className="flex items-center gap-2">
          {/* Start Sprint Button */}
          {selectedSprint && selectedSprint.status === "PLANNED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartSprint}
              disabled={statusUpdateLoading || isDeletingSprint}
              className="h-9 gap-1.5 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 font-medium"
            >
              {statusUpdateLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              <span>Start Sprint</span>
            </Button>
          )}

          {/* Complete Sprint Button */}
          {selectedSprint && selectedSprint.status === "ACTIVE" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCompleteSprint}
              disabled={statusUpdateLoading || isDeletingSprint}
              className="h-9 gap-1.5 border-blue-500/40 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400 font-medium"
            >
              {statusUpdateLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>Complete Sprint</span>
            </Button>
          )}

          {/* Delete Sprint Button Action */}
          {selectedSprint && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDeleteSprint}
              disabled={statusUpdateLoading || isDeletingSprint}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete sprint"
            >
              {isDeletingSprint ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="sr-only">Delete Sprint</span>
            </Button>
          )}
        </div>
      </div>

      {/* Sprint Kanban Board for Selected Sprint */}
      {selectedSprint && (
        <div className="pt-2 animate-in fade-in duration-200">
          <SprintBoard
            key={selectedSprint.id}
            sprint={selectedSprint}
            projectKey={project.key}
            projectId={project.id}
            orgId={project.organizationId}
          />
        </div>
      )}

      {/* Empty State when no sprints exist and form is closed */}
      {(!sprints || sprints.length === 0) && !showCreateForm && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10 p-10 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">No sprints yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create your first sprint to start planning iterations, assigning tasks, and tracking velocity.
          </p>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="mt-2 gap-2"
          >
            <Plus className="h-4 w-4" />
            Create First Sprint
          </Button>
        </div>
      )}
    </div>
  );
}
