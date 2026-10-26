"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

/**
 * Server action to create a new sprint in a project.
 *
 * @param {string} projectId - ID of the project.
 * @param {Object} data - Sprint creation data { name, startDate, endDate }.
 * @returns {Promise<Object>} Created sprint record.
 */
export async function createSprint(projectId, data) {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized: Please sign in to create a sprint");
  }

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    try {
      const { checkUser } = await import("@/lib/checkUser");
      user = await checkUser();
    } catch (e) {
      console.error("Error auto-syncing user in createSprint:", e);
    }
  }

  if (!user) {
    throw new Error("User record not found. Please refresh and try again.");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Authorization check
  let hasAccess = Boolean(orgId && project.organizationId === orgId);

  if (!hasAccess) {
    try {
      const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;
      const memberships = await client.organizations.getOrganizationMembershipList({
        organizationId: project.organizationId,
      });

      const userMembership = memberships?.data?.find(
        (member) => member.publicUserData?.userId === userId
      );

      if (userMembership) {
        hasAccess = true;
      }

      if (!hasAccess) {
        const userMemberships = await client.users.getOrganizationMembershipList({
          userId,
        });
        const isMember = userMemberships?.data?.some(
          (m) => m.organization?.id === project.organizationId
        );
        if (isMember) {
          hasAccess = true;
        }
      }
    } catch (err) {
      console.error("Error verifying organization membership:", err);
    }
  }

  if (!hasAccess) {
    throw new Error("Unauthorized: You do not have permission to create sprints for this project");
  }

  try {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid start or end date provided");
    }

    if (endDate <= startDate) {
      throw new Error("End date must be after start date");
    }

    const sprint = await db.sprint.create({
      data: {
        name: data.name,
        startDate,
        endDate,
        status: "PLANNED",
        projectId,
      },
    });

    return sprint;
  } catch (error) {
    console.error("Error creating sprint:", error);
    throw new Error(error.message || "Failed to create sprint");
  }
}

/**
 * Server action to update sprint status (e.g. start or complete sprint).
 *
 * @param {string} sprintId - ID of the sprint.
 * @param {string} status - New status ("PLANNED" | "ACTIVE" | "COMPLETED").
 * @returns {Promise<Object>} Updated sprint record.
 */
export async function updateSprintStatus(sprintId, status) {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const sprint = await db.sprint.findUnique({
    where: { id: sprintId },
    include: { project: true },
  });

  if (!sprint) {
    throw new Error("Sprint not found");
  }

  // Verify access
  let hasAccess = Boolean(orgId && sprint.project.organizationId === orgId);

  if (!hasAccess) {
    try {
      const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;
      const memberships = await client.organizations.getOrganizationMembershipList({
        organizationId: sprint.project.organizationId,
      });

      const userMembership = memberships?.data?.find(
        (m) => m.publicUserData?.userId === userId
      );

      if (userMembership) {
        hasAccess = true;
      }
    } catch (err) {
      console.error("Error checking permissions:", err);
    }
  }

  if (!hasAccess) {
    throw new Error("Unauthorized to modify this sprint");
  }

  // If activating sprint, ensure no other sprint is currently ACTIVE in this project
  if (status === "ACTIVE") {
    const activeSprint = await db.sprint.findFirst({
      where: {
        projectId: sprint.projectId,
        status: "ACTIVE",
      },
    });

    if (activeSprint && activeSprint.id !== sprintId) {
      throw new Error(`An active sprint already exists ("${activeSprint.name}"). Complete it before starting a new one.`);
    }
  }

  const updatedSprint = await db.sprint.update({
    where: { id: sprintId },
    data: { status },
  });

  return updatedSprint;
}

/**
 * Server action to delete a sprint.
 *
 * @param {string} sprintId - ID of the sprint to delete.
 * @returns {Promise<Object>} Success indicator.
 */
export async function deleteSprint(sprintId) {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const sprint = await db.sprint.findUnique({
    where: { id: sprintId },
    include: { project: true },
  });

  if (!sprint) {
    throw new Error("Sprint not found");
  }

  let hasAccess = Boolean(orgId && sprint.project.organizationId === orgId);

  if (!hasAccess) {
    try {
      const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;
      const memberships = await client.organizations.getOrganizationMembershipList({
        organizationId: sprint.project.organizationId,
      });

      const userMembership = memberships?.data?.find(
        (m) => m.publicUserData?.userId === userId
      );

      if (userMembership) {
        hasAccess = true;
      }
    } catch (err) {
      console.error("Error verifying permissions in deleteSprint:", err);
    }
  }

  if (!hasAccess) {
    throw new Error("Unauthorized: You do not have permission to delete this sprint");
  }

  await db.sprint.delete({
    where: { id: sprintId },
  });

  return { success: true };
}

/**
 * Server action to edit sprint details (name, dates).
 */
export async function updateSprint(sprintId, data) {
  const { userId, orgId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const sprint = await db.sprint.findUnique({
    where: { id: sprintId },
    include: { project: true },
  });

  if (!sprint) {
    throw new Error("Sprint not found");
  }

  let hasAccess = Boolean(orgId && sprint.project.organizationId === orgId);
  if (!hasAccess) {
    try {
      const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;
      const memberships = await client.organizations.getOrganizationMembershipList({
        organizationId: sprint.project.organizationId,
      });
      const userMembership = memberships?.data?.find(
        (m) => m.publicUserData?.userId === userId
      );
      if (userMembership) hasAccess = true;
    } catch (err) {
      console.error("Error checking permissions in updateSprint:", err);
    }
  }

  if (!hasAccess) {
    throw new Error("Unauthorized to edit this sprint");
  }

  const updatedSprint = await db.sprint.update({
    where: { id: sprintId },
    data: {
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
      ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
    },
  });

  return updatedSprint;
}

