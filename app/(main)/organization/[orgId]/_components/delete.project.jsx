"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { deleteProject } from "@/actions/project";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOrganization } from "@clerk/nextjs";

export default function DeleteProject({ projectId }) {
    const { membership } = useOrganization();
    const router = useRouter();

    const {
        loading: isDeleting,
        fn: deleteProjectFn,
        data: deleted,
    } = useFetch(deleteProject);

    const isAdmin = membership?.role === "org:admin";

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm("Are you sure you want to delete this project? This action will permanently remove all associated sprints and issues.")) {
            return;
        }

        await deleteProjectFn(projectId);
    };

    useEffect(() => {
        if (deleted?.success) {
            toast.success("Project deleted successfully");
            router.refresh();
        }
    }, [deleted, router]);

    if (!isAdmin) {
        return null;
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            disabled={isDeleting}
            onClick={handleDelete}
            title="Delete Project"
        >
            {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin text-destructive" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    );
}
