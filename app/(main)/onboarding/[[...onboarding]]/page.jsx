"use client";

import { OrganizationList, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Onboarding = () => {
  const { organization, isLoaded } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && organization?.slug) {
      router.push(`/organization/${organization.slug}`);
    }
  }, [organization, isLoaded, router]);

  return (
    <div className="flex justify-center items-center pt-14">
      <OrganizationList
        hidePersonal
        afterCreateOrganizationUrl="/organization/:slug"
        afterSelectOrganizationUrl="/organization/:slug"
      />
    </div>
  );
};

export default Onboarding;