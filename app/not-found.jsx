import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[65vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-6">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        The project, page, or resource you are looking for doesn&apos;t exist or you do not have permission to view it.
      </p>
      <Button asChild className="mt-6" variant="default">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
