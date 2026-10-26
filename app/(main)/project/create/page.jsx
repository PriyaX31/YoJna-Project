'use client'

import React, { useState, useEffect } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import OrgSwitcher from "@/components/org-switcher";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { createProject } from "@/actions/projects";
import { toast } from "sonner";

const CreateProjectPage = () => {
  const router = useRouter();
  const { isLoaded: isOrgLoaded, membership, organization } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      key: "",
      description: "",
    },
  });

  const {
    data: project,
    loading,
    error,
    fn: createProjectFn,
  } = useFetch(createProject);

  useEffect(() => {
    if (isOrgLoaded && isUserLoaded && membership) {
      setIsAdmin(membership.role === "org:admin");
    }
  }, [isOrgLoaded, isUserLoaded, membership]);

  useEffect(() => {
    if (project) {
      toast.success("Project created successfully!");
      router.push(`/project/${project.id}`);
    }
  }, [project, router]);

  if (!isOrgLoaded || !isUserLoaded) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center min-h-[60vh]">
        <span className="text-2xl font-bold gradient-title">Oops! Only Admins can create projects.</span>
        <OrgSwitcher />
      </div>
    );
  }

  const onSubmit = async (data) => {
    await createProjectFn({ ...data, orgId: organization?.id });
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <h1 className="text-6xl font-bold gradient-title text-center mb-8">Create New Project</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Project Name
          </label>
          <Input
            id="name"
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2 text-white bg-slate-950"
            placeholder="Jira Clone"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="key" className="block text-sm font-medium mb-1">
            Project Key
          </label>
          <Input
            id="key"
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2 text-white bg-slate-950"
            placeholder="RCJC (Uppercase acronym)"
            {...register("key")}
          />
          {errors.key && (
            <p className="text-red-500 text-sm mt-1">{errors.key.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Project Description
          </label>
          <Textarea
            id="description"
            className="border border-gray-300 rounded-md px-3 py-2 text-white bg-slate-950 h-28"
            placeholder="Describe your project..."
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error.message}</p>}

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Creating..." : "Create Project"}
        </Button>
      </form>
    </div>
  );
};

export default CreateProjectPage;