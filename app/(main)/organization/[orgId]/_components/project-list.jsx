import Link from "next/link";
import { getProjects } from "@/actions/project";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, ArrowRight, Plus, Calendar } from "lucide-react";
import DeleteProject from "./delete.project";

export default async function ProjectList({ orgId }) {
  const projects = await getProjects(orgId);

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <FolderKanban className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">No projects found</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          Get started by creating your first project to organize tasks, manage sprints, and track team progress.
        </p>
        <Button asChild className="mt-6 shadow-sm">
          <Link href="/project/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/project/${project.id}`}
          className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Card className="h-full flex flex-col justify-between overflow-hidden border border-border/60 bg-gradient-to-b from-card to-card/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {project.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="mt-1 font-mono text-[10px] tracking-wider uppercase text-muted-foreground border-border/80"
                    >
                      {project.key}
                    </Badge>
                  </div>
                </div>
                <DeleteProject projectId={project.id} />
              </div>
            </CardHeader>

            <CardContent className="flex-1 pb-4">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {project.description || "No description provided for this project."}
              </p>
            </CardContent>

            <CardFooter className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 bg-muted/20 py-3">
              <div className="flex items-center gap-1.5 text-[11px]">
                <Calendar className="h-3.5 w-3.5 opacity-70" />
                <span>
                  {project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recently"}
                </span>
              </div>
              <div className="flex items-center gap-1 font-medium text-primary text-xs">
                <span>View Project</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}

