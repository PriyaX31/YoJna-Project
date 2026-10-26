"use client";

import React from "react";
import { OrganizationSwitcher, useOrganization, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { usePathname } from "next/navigation";

const OrgSwitcher = () => {
  const { isLoaded: isOrgLoaded } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const pathname = usePathname();

  // Return null if Clerk hasn't finished loading user/organization data yet
  if (!isOrgLoaded || !isUserLoaded) {
    return (
      <div className="h-9 w-44 animate-pulse rounded-lg bg-muted/40 border border-border/50" />
    );
  }

  return (
    <div className="flex items-center">
      <OrganizationSwitcher
        hidePersonal={true}
        afterCreateOrganizationUrl="/organization/:slug"
        afterSelectOrganizationUrl="/organization/:slug"
        afterLeaveOrganizationUrl="/onboarding"
        afterSelectPersonalUrl="/onboarding"
        createOrganizationMode={pathname === "/onboarding" ? "navigation" : "modal"}
        createOrganizationUrl="/onboarding"
        organizationProfileMode="modal"
        organizationProfileProps={{
          appearance: {
            baseTheme: dark,
            // Ensure no danger section, delete flow, or modal actions are suppressed
            elements: {
              card: "shadow-2xl border border-border bg-card",
            },
          },
        }}
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: "w-full sm:w-auto",
            organizationSwitcherTrigger:
              "border border-border/70 bg-card/80 hover:bg-muted/60 text-foreground rounded-lg px-3.5 py-2 shadow-xs transition-colors flex items-center justify-between gap-2.5 text-xs font-semibold",
            organizationPreviewTextContainer: "text-foreground font-semibold",
            organizationSwitcherTriggerIcon: "text-muted-foreground w-4 h-4",
          },
        }}
      />
    </div>
  );
};

export default OrgSwitcher;