import { z } from "zod";

/**
 * Zod schema for validating Project creation forms.
 */
export const projectSchema = z.object({
    name: z
        .string()
        .min(1, "Project name is required")
        .max(100, "Project name must be 100 characters or less"),
    key: z
        .string()
        .min(2, "Project key must be at least 2 characters")
        .max(10, "Project key must be 10 characters or less"),
    description: z
        .string()
        .max(500, "Description must be 500 characters or less")
        .optional(),
});

export const sprintSchema = z.object({
    name: z.string().min(1, "Sprint name is required"),
    startDate: z.date(),
    endDate: z.date(),
});

export const issueSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().max(1000, "Description is too long").optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
    assigneeId: z.string().optional().nullable(),
    sprintId: z.string().optional().nullable(),
});