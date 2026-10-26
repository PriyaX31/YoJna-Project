import React, { Suspense } from "react";
import { BarLoader } from "@/components/loader";

const ProjectLayout = async ({ children }) => {
  return (
    <div className="mx-auto min-h-screen dotted-background">
      <Suspense fallback={<BarLoader width="100%" color="#36b7b7" className="mb-4" />}>
        {children}
      </Suspense>
    </div>
  );
};

export default ProjectLayout;
