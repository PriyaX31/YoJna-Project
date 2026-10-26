"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// In-memory cache for organization memberships to avoid repeated slow Clerk API round-trips
const orgMembershipCache = new Map();
const MEMBERSHIP_CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

async function checkOrgMembership(userId, projectOrgId, sessionOrgId) {
  // If active org in session matches project's org, access is guaranteed immediately
  if (sessionOrgId && sessionOrgId === projectOrgId) {
    return true;
  }

  const cacheKey = `${userId}:${projectOrgId}`;
  const cached = orgMembershipCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < MEMBERSHIP_CACHE_TTL) {
    return cached.hasAccess;
  }

  try {
    const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;
    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId: projectOrgId,
    });

    const userMembership = memberships?.data?.find(
      (m) => m.publicUserData?.userId === userId
    );

    if (userMembership) {
      orgMembershipCache.set(cacheKey, { hasAccess: true, timestamp: Date.now() });
      return true;
    }

    // Also check user's organizations list
    const userMemberships = await client.users.getOrganizationMembershipList({
      userId,
    });

    const isMember = userMemberships?.data?.some(
      (m) => m.organization?.id === projectOrgId
    );

    if (isMember) {
      orgMembershipCache.set(cacheKey, { hasAccess: true, timestamp: Date.now() });
      return true;
    }

    return false;
  } catch (err) {
    console.error("Error checking permissions in createIssue:", err);
    return false;
  }
}

/**
 * Server action to create a new issue with high-performance parallelized queries.
 *
 * @param {string} projectId - Project ID the issue belongs to.
 * @param {Object} data - Issue data { title, description, priority, status, assigneeId, sprintId }.
 * @returns {Promise<Object>} Created issue record.
 */
export async function createIssue(projectId, data) {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized: Please sign in to create an issue");
  }

  const status = data.status || "TODO";
  let sprintId = data.sprintId || null;

  // Run user lookup, project lookup, and last issue order concurrently in a single batch
  let [user, project, lastIssue] = await Promise.all([
    db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    }),
    db.project.findUnique({
      where: { id: projectId },
      select: { id: true, organizationId: true },
    }),
    db.issue.findFirst({
      where: {
        projectId,
        status,
        sprintId,
      },
      orderBy: { order: "desc" },
      select: { order: true },
    }),
  ]);

  if (!user) {
    try {
      const { checkUser } = await import("@/lib/checkUser");
      user = await checkUser();
    } catch (e) {
      console.error("Error auto-syncing user in createIssue:", e);
    }
  }

  if (!user) {
    throw new Error("User record not found");
  }

  if (!project) {
    throw new Error("Project not found");
  }

  // Fast-path permission check with in-memory caching
  const hasAccess = await checkOrgMembership(userId, project.organizationId, orgId);
  if (!hasAccess) {
    throw new Error("Unauthorized to create issues in this project");
  }

  // Validate assigneeId to avoid foreign key errors
  let assigneeId = data.assigneeId;
  if (assigneeId && assigneeId !== "unassigned") {
    const assigneeExists = await db.user.findUnique({
      where: { id: assigneeId },
      select: { id: true },
    });
    if (!assigneeExists) {
      assigneeId = null;
    }
  } else {
    assigneeId = null;
  }

  // Validate sprintId to avoid foreign key errors
  if (sprintId) {
    const sprintExists = await db.sprint.findUnique({
      where: { id: sprintId },
      select: { id: true },
    });
    if (!sprintExists) {
      sprintId = null;
    }
  }

  const nextOrder = lastIssue ? lastIssue.order + 1 : 0;

  const issue = await db.issue.create({
    data: {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : null,
      priority: data.priority || "MEDIUM",
      status,
      order: nextOrder,
      projectId,
      sprintId,
      reporterId: user.id,
      assigneeId,
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });

  revalidatePath(`/project/${projectId}`);

  return issue;
}

/**
 * Server action to update an issue's status and order (e.g. dragging across columns).
 *
 * @param {string} issueId - Issue ID.
 * @param {string} status - New IssueStatus.
 * @param {number} [order] - New order index within column.
 * @returns {Promise<Object>} Updated issue record.
 */
export async function updateIssueStatus(issueId, status, order) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  const updateData = { status };
  if (typeof order === "number") {
    updateData.order = order;
  }

  const updated = await db.issue.update({
    where: { id: issueId },
    data: updateData,
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return updated;
}

/**
 * Server action to update multiple issues' status and order in a single transaction (for Kanban drag & drop).
 *
 * @param {Array<{ id: string, status: string, order: number }>} updatedIssues
 * @returns {Promise<Object>} Success indicator.
 */
export async function updateIssueOrder(updatedIssues) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!updatedIssues || updatedIssues.length === 0) {
    return { success: true };
  }

  await db.$transaction(
    updatedIssues.map((issue) =>
      db.issue.update({
        where: { id: issue.id },
        data: {
          status: issue.status,
          order: issue.order,
        },
      })
    )
  );

  return { success: true };
}


/**
 * Server action to update issue details (priority, assignee, title, description).
 */
export async function updateIssue(issueId, data) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const updated = await db.issue.update({
    where: { id: issueId },
    data: {
      ...(data.title ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.priority ? { priority: data.priority } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId || null } : {}),
    },
    include: {
      assignee: true,
      reporter: true,
    },
  });

  return updated;
}

/**
 * Server action to delete an issue.
 */
export async function deleteIssue(issueId) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db.issue.delete({
    where: { id: issueId },
  });

  return { success: true };
}
