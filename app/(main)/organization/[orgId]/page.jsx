import React from "react";
import { redirect } from "next/navigation";
import { getOrganization } from "@/actions/organization";
import OrgSwitcher from "@/components/org-switcher";
import OrgProfileModal from "./_components/org-profile-modal";
import ProjectList from "./_components/project-list";

const OrganizationPage = async ({ params }) => {
  const { orgId } = await params;

  const organization = await getOrganization(orgId);

  if (!organization) {
    redirect("/onboarding");
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          {organization.name}&rsquo;s Projects
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <OrgProfileModal />
          <OrgSwitcher />
        </div>
      </div>

      <div className="mb-4">
        <ProjectList orgId={organization.id} />
      </div>
      <div className="mb-8">show user assigned and reported issues here</div>
    </div>
  );
};

export default OrganizationPage;
