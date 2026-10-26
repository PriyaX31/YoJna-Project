"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Equal,
  Trash2,
  Loader2,
  GripVertical,
} from "lucide-react";
import { deleteIssue } from "@/actions/issues";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

function getPriorityBadge(priority) {
  switch (priority) {
    case "URGENT":
      return (
        <Badge className="bg-red-500/15 text-red-500 hover:bg-red-500/20 border-red-500/30 text-[10px] px-1.5 py-0 gap-1 font-semibold uppercase">
          <AlertCircle className="h-3 w-3" />
          Urgent
        </Badge>
      );
    case "HIGH":
      return (
        <Badge className="bg-orange-500/15 text-orange-500 hover:bg-orange-500/20 border-orange-500/30 text-[10px] px-1.5 py-0 gap-1 font-semibold uppercase">
          <ArrowUp className="h-3 w-3" />
          High
        </Badge>
      );
    case "LOW":
      return (
        <Badge variant="outline" className="text-muted-foreground border-border text-[10px] px-1.5 py-0 gap-1 font-semibold uppercase">
          <ArrowDown className="h-3 w-3" />
          Low
        </Badge>
      );
    case "MEDIUM":
    default:
      return (
        <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-[10px] px-1.5 py-0 gap-1 font-semibold uppercase">
          <Equal className="h-3 w-3" />
          Med
        </Badge>
      );
  }
}

function getPriorityBorder(priority) {
  switch (priority) {
    case "URGENT":
      return "border-l-4 border-l-red-500 bg-red-500/[0.02]";
    case "HIGH":
      return "border-l-4 border-l-orange-500 bg-orange-500/[0.02]";
    case "LOW":
      return "border-l-4 border-l-blue-400 bg-blue-500/[0.02]";
    case "MEDIUM":
    default:
      return "border-l-4 border-l-amber-500 bg-amber-500/[0.02]";
  }
}

export default function IssueCard({
  issue,
  projectKey,
  onStatusChange,
  onDelete,
  isDragging = false,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    loading: isDeleting,
    fn: deleteIssueFn,
  } = useFetch(deleteIssue);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete issue "${issue.title}"?`)) {
      await deleteIssueFn(issue.id);
      toast.success("Issue deleted");
      if (onDelete) {
        onDelete(issue.id);
      }
    }
  };

  const assigneeInitials = issue.assignee?.name
    ? issue.assignee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "UN";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col gap-2 rounded-xl border p-3.5 transition-all duration-150 select-none ${getPriorityBorder(
        issue.priority
      )} ${
        isDragging
          ? "border-primary bg-card shadow-2xl ring-2 ring-primary/50 rotate-1 scale-[1.02] z-50 opacity-95"
          : issue.isOptimistic
          ? "border-primary/50 bg-card/90 opacity-90 ring-1 ring-primary/20 shadow-xs cursor-default"
          : "border-border/70 bg-card shadow-xs hover:border-primary/50 hover:shadow-md cursor-grab active:cursor-grabbing"
      }`}
    >
      {/* Top Header: Key & Priority */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          {issue.isOptimistic ? (
            <span className="flex items-center gap-1 text-[10px] text-primary font-medium font-mono animate-pulse">
              <Loader2 className="h-2.5 w-2.5 animate-spin" /> Saving...
            </span>
          ) : (
            <span className="font-mono text-[11px] font-semibold text-muted-foreground">
              {projectKey}-{issue.order + 1}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {getPriorityBadge(issue.priority)}
          {isHovered && !issue.isOptimistic && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
              title="Delete issue"
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
        {issue.title}
      </h4>

      {/* Description Snippet (optional) */}
      {issue.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2">
          {issue.description}
        </p>
      )}

      {/* Footer: Status select & Assignee avatar */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2 mt-1">
        {/* Quick Status Changer using shadcn UI Select */}
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={issue.status}
            onValueChange={(newStatus) => {
              if (newStatus !== issue.status && onStatusChange) {
                onStatusChange(issue.id, newStatus);
              }
            }}
          >
            <SelectTrigger className="h-6 text-[10px] font-semibold px-2 py-0 border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assignee Avatar */}
        <div className="flex items-center gap-1">
          <Avatar className="h-5 w-5 ring-1 ring-border">
            {issue.assignee?.imageUrl && (
              <AvatarImage src={issue.assignee.imageUrl} alt={issue.assignee.name || "Assignee"} />
            )}
            <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
              {assigneeInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
