"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";
import IssueCard from "./issue-card";
import IssueCreationDrawer from "./issue-creation-drawer";
import { updateIssueStatus, updateIssueOrder } from "@/actions/issues";
import { getOrganizationUsers } from "@/actions/organization";
import { getSprintStatusBadge } from "./sprint-manager";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const COLUMNS = [
  {
    key: "TODO",
    title: "To Do",
    dotColor: "bg-slate-400",
    badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    columnBg: "bg-slate-500/[0.04] border-slate-500/25 hover:border-slate-500/40",
    headerColor: "text-slate-300",
    accentBorder: "border-t-2 border-t-slate-400/90",
  },
  {
    key: "IN_PROGRESS",
    title: "In Progress",
    dotColor: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    columnBg: "bg-blue-500/[0.04] border-blue-500/25 hover:border-blue-500/40",
    headerColor: "text-blue-400",
    accentBorder: "border-t-2 border-t-blue-500",
  },
  {
    key: "IN_REVIEW",
    title: "In Review",
    dotColor: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    columnBg: "bg-purple-500/[0.04] border-purple-500/25 hover:border-purple-500/40",
    headerColor: "text-purple-400",
    accentBorder: "border-t-2 border-t-purple-500",
  },
  {
    key: "DONE",
    title: "Done",
    dotColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    columnBg: "bg-emerald-500/[0.04] border-emerald-500/25 hover:border-emerald-500/40",
    headerColor: "text-emerald-400",
    accentBorder: "border-t-2 border-t-emerald-500",
  },
];

export default function SprintBoard({
  sprint,
  projectKey,
  projectId,
  orgId,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [issues, setIssues] = useState(sprint?.issues || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerStatus, setDrawerStatus] = useState("TODO");
  const [orgUsers, setOrgUsers] = useState([]);

  // Ensure client-side mounting for hydration safety with DragDropContext
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync issues when sprint changes
  useEffect(() => {
    setIssues(sprint?.issues || []);
  }, [sprint]);

  // Load organization users for assignee selector
  const {
    data: fetchedUsers,
    fn: fetchUsersFn,
  } = useFetch(getOrganizationUsers);

  useEffect(() => {
    if (orgId) {
      fetchUsersFn(orgId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  useEffect(() => {
    if (fetchedUsers) {
      setOrgUsers(fetchedUsers);
    }
  }, [fetchedUsers]);

  const { fn: updateStatusFn } = useFetch(updateIssueStatus);
  const { fn: updateOrderFn } = useFetch(updateIssueOrder);

  // Handle Drag & Drop reorder / move across columns with @hello-pangea/dnd
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    let newIssues = [...issues];

    // Case 1: Reordering within the SAME column
    if (sourceStatus === destStatus) {
      const colIssues = issues
        .filter((i) => i.status === sourceStatus)
        .sort((a, b) => a.order - b.order);

      const [moved] = colIssues.splice(source.index, 1);
      colIssues.splice(destination.index, 0, moved);

      const updatedColIssues = colIssues.map((issue, idx) => ({
        ...issue,
        order: idx,
      }));

      newIssues = newIssues.map((issue) => {
        const found = updatedColIssues.find((u) => u.id === issue.id);
        return found || issue;
      });

      setIssues(newIssues);

      try {
        await updateOrderFn(
          updatedColIssues.map((i) => ({
            id: i.id,
            status: i.status,
            order: i.order,
          }))
        );
      } catch (err) {
        toast.error("Failed to persist order");
        setIssues(sprint?.issues || []);
      }
      return;
    }

    // Case 2: Moving ACROSS columns
    const sourceColIssues = issues
      .filter((i) => i.status === sourceStatus)
      .sort((a, b) => a.order - b.order);

    const destColIssues = issues
      .filter((i) => i.status === destStatus)
      .sort((a, b) => a.order - b.order);

    const [moved] = sourceColIssues.splice(source.index, 1);
    const updatedMoved = { ...moved, status: destStatus };

    destColIssues.splice(destination.index, 0, updatedMoved);

    const updatedSource = sourceColIssues.map((issue, idx) => ({
      ...issue,
      order: idx,
    }));

    const updatedDest = destColIssues.map((issue, idx) => ({
      ...issue,
      order: idx,
    }));

    const allUpdated = [...updatedSource, ...updatedDest];
    newIssues = newIssues.map((issue) => {
      const found = allUpdated.find((u) => u.id === issue.id);
      return found || issue;
    });

    setIssues(newIssues);
    toast.success(`Moved to ${destStatus.replace("_", " ")}`);

    try {
      await updateOrderFn(
        allUpdated.map((i) => ({
          id: i.id,
          status: i.status,
          order: i.order,
        }))
      );
    } catch (err) {
      toast.error("Failed to update status on server");
      setIssues(sprint?.issues || []);
    }
  };

  // Handle status update via Select dropdown on card
  const handleStatusChange = async (issueId, newStatus) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === issueId ? { ...item, status: newStatus } : item
      )
    );

    try {
      await updateStatusFn(issueId, newStatus);
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
    } catch (err) {
      toast.error("Failed to update status");
      setIssues(sprint?.issues || []);
    }
  };

  const handleIssueDeleted = (deletedId) => {
    setIssues((prev) => prev.filter((i) => i.id !== deletedId));
  };

  const handleIssueCreated = (created, tempId) => {
    setIssues((prev) => {
      if (tempId) {
        return prev.map((item) => (item.id === tempId ? created : item));
      }
      return [...prev, created];
    });
  };

  const handleIssueFailed = (tempId) => {
    setIssues((prev) => prev.filter((item) => item.id !== tempId));
  };

  // Filter issues based on search and priority
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (issue.description &&
          issue.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        priorityFilter === "ALL" || issue.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [issues, searchQuery, priorityFilter]);

  // Sprint Progress stats
  const totalIssuesCount = issues.length;
  const doneIssuesCount = issues.filter((i) => i.status === "DONE").length;
  const completionPercentage =
    totalIssuesCount > 0
      ? Math.round((doneIssuesCount / totalIssuesCount) * 100)
      : 0;

  return (
    <div className="w-full space-y-4">
      {/* Sprint Header & Info Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {sprint?.name || "Sprint Kanban Board"}
          </h2>
          {sprint && getSprintStatusBadge(sprint)}
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {filteredIssues.length} of {totalIssuesCount} issue{totalIssuesCount === 1 ? "" : "s"} shown
        </span>
      </div>

      {/* Board Controls & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
        {/* Left: Search & Filter using shadcn UI Select */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8.5 pl-8 text-xs bg-background/60"
            />
          </div>

          {/* Priority Filter using shadcn UI Select */}
          <div className="min-w-[140px]">
            <Select
              value={priorityFilter}
              onValueChange={(val) => setPriorityFilter(val)}
            >
              <SelectTrigger className="h-8.5 text-xs bg-background/60">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3 w-3 text-muted-foreground" />
                  <SelectValue placeholder="Priority" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters button */}
          {(searchQuery || priorityFilter !== "ALL") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchQuery("");
                setPriorityFilter("ALL");
              }}
              className="h-8.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Right: Sprint Progress & Create Issue Button */}
        <div className="flex items-center gap-3">
          {/* Sprint Progress Indicator */}
          {totalIssuesCount > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex flex-col text-right">
                <span className="text-[11px] font-mono text-muted-foreground">
                  {doneIssuesCount}/{totalIssuesCount} completed
                </span>
                <span className="text-[10px] font-semibold text-primary">
                  {completionPercentage}% Done
                </span>
              </div>
              <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Create Issue Button */}
          <Button
            size="sm"
            onClick={() => {
              setDrawerStatus("TODO");
              setIsDrawerOpen(true);
            }}
            className="h-8.5 gap-1.5 text-xs font-semibold shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Issue</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board 4 Columns with @hello-pangea/dnd */}
      {isMounted ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {COLUMNS.map((col) => {
              const colIssues = filteredIssues
                .filter((i) => i.status === col.key)
                .sort((a, b) => a.order - b.order);

              return (
                <Droppable key={col.key} droppableId={col.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col rounded-xl border p-3 min-h-[480px] transition-all duration-200 ${col.accentBorder} ${
                        snapshot.isDraggingOver
                          ? "bg-primary/10 border-primary/50 ring-2 ring-primary/20 scale-[1.01]"
                          : `${col.columnBg}`
                      }`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                          <h3 className={`text-xs font-bold uppercase tracking-wider ${col.headerColor}`}>
                            {col.title}
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 font-mono font-bold ${col.badgeClass}`}
                        >
                          {colIssues.length}
                        </Badge>
                      </div>

                      {/* Column Issues List with Draggable items */}
                      <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[120px]">
                        {colIssues.map((issue, index) => (
                          <Draggable
                            key={issue.id}
                            draggableId={issue.id}
                            index={index}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className="touch-none"
                              >
                                <IssueCard
                                  issue={issue}
                                  projectKey={projectKey}
                                  onStatusChange={handleStatusChange}
                                  onDelete={handleIssueDeleted}
                                  isDragging={dragSnapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {colIssues.length === 0 && !snapshot.isDraggingOver && (
                          <div className="h-32 flex flex-col items-center justify-center rounded-lg border border-dashed border-border/40 text-center p-3 text-muted-foreground/60 space-y-1.5">
                            <Layers className="h-5 w-5 opacity-40" />
                            <span className="text-[11px]">No issues</span>
                            <button
                              type="button"
                              onClick={() => {
                                setDrawerStatus(col.key);
                                setIsDrawerOpen(true);
                              }}
                              className="text-[10px] text-primary hover:underline font-medium"
                            >
                              + Add issue
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Quick Add Issue to this Column */}
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerStatus(col.key);
                          setIsDrawerOpen(true);
                        }}
                        className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-dashed border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add issue</span>
                      </button>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        /* Static Column Placeholder before client mount */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className={`flex flex-col rounded-xl border p-3 min-h-[480px] ${col.accentBorder} ${col.columnBg}`}
            >
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/50">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.headerColor}`}>
                  {col.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Issue Drawer (shadcn Drawer) */}
      <IssueCreationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        projectId={projectId}
        sprintId={sprint?.id}
        defaultStatus={drawerStatus}
        orgUsers={orgUsers}
        onIssueCreated={handleIssueCreated}
        onIssueFailed={handleIssueFailed}
      />
    </div>
  );
}
