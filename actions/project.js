"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function createProject(data) {
    const { userId, orgId: sessionOrgId } = auth();

    if (!userId) {
        throw new Error("Unauthorized: You must be logged in to create a project");
    }

    let orgId = sessionOrgId || data?.orgId;

    // Fallback: If active orgId is not yet in the session token, check Clerk for the user's organization
    if (!orgId) {
        try {
            const userMemberships = await clerkClient.users.getOrganizationMembershipList({
                userId,
            });

            if (userMemberships?.data?.length > 0) {
                const adminMembership = userMemberships.data.find(
                    (m) => m.role === "org:admin"
                );
                orgId = adminMembership
                    ? adminMembership.organization.id
                    : userMemberships.data[0].organization.id;
            }
        } catch (err) {
            console.error("Error looking up user organizations:", err);
        }
    }

    if (!orgId) {
        throw new Error("Unauthorized: No organization selected. Please create or select an organization first.");
    }

    const memberships = await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: orgId,
    });

    const userMembership = memberships.data.find(
        (member) => member.publicUserData.userId === userId
    );

    if (!userMembership || userMembership.role !== "org:admin") {
        throw new Error("Only organization admins can create projects");
    }

    try {
        const project = await db.project.create({
            data: {
                name: data.name,
                key: data.key.toUpperCase(),
                description: data.description,
                organizationId: orgId,
            },
        });

        return project;
    } catch (error) {
        if (error.code === "P2002") {
            throw new Error("A project with this key already exists in your organization");
        }
        throw new Error("Error creating project: " + error.message);
    }
}

export async function getProjects(orgId) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const projects = await db.project.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
    });

    return projects;
}

export async function deleteProject(projectId) {
    const { userId, orgId, orgRole } = auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const project = await db.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    let isAdmin = false;

    // 1. Fast path: active session matches project organization and role is admin
    if (orgId === project.organizationId && orgRole === "org:admin") {
        isAdmin = true;
    } else {
        // 2. Check organization membership list in Clerk
        try {
            const memberships = await clerkClient.organizations.getOrganizationMembershipList({
                organizationId: project.organizationId,
            });

            const userMembership = memberships?.data?.find(
                (member) => member.publicUserData.userId === userId
            );

            if (userMembership && userMembership.role === "org:admin") {
                isAdmin = true;
            }
        } catch (err) {
            console.error("Error checking organization membership:", err);
        }

        // 3. Fallback: check user's memberships in Clerk
        if (!isAdmin) {
            try {
                const userMemberships = await clerkClient.users.getOrganizationMembershipList({
                    userId,
                });

                const adminMembership = userMemberships?.data?.find(
                    (m) => m.organization.id === project.organizationId && m.role === "org:admin"
                );

                if (adminMembership) {
                    isAdmin = true;
                }
            } catch (err) {
                console.error("Error checking user organization list:", err);
            }
        }
    }

    if (!isAdmin) {
        throw new Error("Only organization admins can delete projects");
    }

    await db.project.delete({
        where: { id: projectId },
    });

    return { success: true };
}

export async function getProject(projectId) {
    const { userId, orgId } = auth();

    if (!userId) {
        return null;
    }

    let user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) {
        try {
            const { checkUser } = await import("@/lib/checkUser");
            user = await checkUser();
        } catch (e) {
            console.error("Error auto-syncing user:", e);
        }
    }

    if (!user) {
        return null;
    }

    const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
            sprints: {
                orderBy: { createdAt: "desc" },
                include: {
                    issues: {
                        include: {
                            assignee: true,
                            reporter: true,
                        },
                        orderBy: { order: "asc" },
                    },
                },
            },
        },
    });

    if (!project) {
        return null;
    }

    // Fast path: session org matches project organization
    if (orgId && project.organizationId === orgId) {
        return project;
    }

    // Fallback: Verify if user belongs to project's organization in Clerk
    try {
        const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;
        const memberships = await client.organizations.getOrganizationMembershipList({
            organizationId: project.organizationId,
        });

        const userMembership = memberships?.data?.find(
            (member) => member.publicUserData?.userId === userId
        );

        if (userMembership) {
            return project;
        }

        // Also check from user's perspective
        const userMemberships = await client.users.getOrganizationMembershipList({
            userId,
        });

        const isMember = userMemberships?.data?.some(
            (m) => m.organization?.id === project.organizationId
        );

        if (isMember) {
            return project;
        }
    } catch (err) {
        console.error("Error verifying project organization membership:", err);
    }

    return null;
}