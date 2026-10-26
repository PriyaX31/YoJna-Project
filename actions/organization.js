"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

/**
 * Fetches organization details by slug and verifies if the current user is a member.
 * @param {string} slug - The organization slug from the URL parameter.
 * @returns {Promise<Object|null>} - Returns the organization object or null if unauthorized/not found.
 */
export async function getOrganization(slug) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    try {
      const { checkUser } = await import("@/lib/checkUser");
      user = await checkUser();
    } catch (e) {
      console.error("Error auto-syncing user in getOrganization:", e);
    }
  }

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;

    // Fetch organization from Clerk using the slug
    const organization = await client.organizations.getOrganization({
      slug: slug,
    });

    if (!organization) {
      return null;
    }

    // Fetch the membership list for the organization to verify access
    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

    // Check if the current user belongs to this organization
    const userMembership = memberships.data.find(
      (member) => member.publicUserData.userId === userId
    );

    if (!userMembership) {
      return null;
    }

    return organization;
  } catch (error) {
    console.error("Error fetching organization:", error);
    return null;
  }
}

/**
 * Fetches all users who are members of a specific organization and ensures they are synced to Prisma DB.
 * @param {string} orgId - The Clerk Organization ID.
 * @returns {Promise<Array>} - Returns an array of user objects from the database.
 */
export async function getOrganizationUsers(orgId) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    try {
      const { checkUser } = await import("@/lib/checkUser");
      user = await checkUser();
    } catch (e) {
      console.error("Error auto-syncing user in getOrganizationUsers:", e);
    }
  }

  try {
    const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;

    // Get all organization memberships from Clerk
    const organizationMemberships = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    if (!organizationMemberships?.data || organizationMemberships.data.length === 0) {
      return [];
    }

    // Extract Clerk User IDs from the memberships list
    const userIds = organizationMemberships.data.map(
      (member) => member.publicUserData.userId
    );

    // Fetch corresponding user records from your NeonDB database
    const users = await db.user.findMany({
      where: {
        clerkUserId: {
          in: userIds,
        },
      },
    });

    // Auto-sync any Clerk member who doesn't yet have a row in NeonDB
    for (const member of organizationMemberships.data) {
      const clerkId = member.publicUserData?.userId;
      if (!clerkId) continue;

      const existsInDb = users.some((u) => u.clerkUserId === clerkId);
      if (!existsInDb) {
        try {
          const name = `${member.publicUserData?.firstName || ""} ${member.publicUserData?.lastName || ""}`.trim() || null;
          const email = member.publicUserData?.identifier || `${clerkId}@clerk.user`;
          const imageUrl = member.publicUserData?.imageUrl || null;

          const createdUser = await db.user.create({
            data: {
              clerkUserId: clerkId,
              name,
              email,
              imageUrl,
            },
          });
          users.push(createdUser);
        } catch (syncErr) {
          console.error("Failed to auto-sync org member to DB:", syncErr);
        }
      }
    }

    return users;
  } catch (error) {
    console.error("Error fetching organization users:", error);
    throw new Error(error.message || "Failed to fetch organization users");
  }
}