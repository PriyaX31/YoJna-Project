import React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getProject } from "@/actions/project";
import SprintManager from "./_components/sprint-manager";

const ProjectPage = async ({ params }) => {
  const { projectId } = await params;
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <SprintManager project={project} sprints={project.sprints} />
    </div>
  );
};

export default ProjectPage;
