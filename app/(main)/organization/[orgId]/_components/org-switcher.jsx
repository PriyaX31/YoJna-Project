
"use client";

import { OrganizationSwitcher, useOrganization } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function OrgSwitcher() {
  const { isLoaded } = useOrganization();

  if (!isLoaded) {
    return (
      <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-800/60 border border-slate-800" />
    );
  }

  return (
    <div className="flex items-center">
      <OrganizationSwitcher
        hidePersonal
        createOrganizationMode="modal"
        organizationProfileMode="modal"
        afterCreateOrganizationUrl="/organization/:slug"
        afterSelectOrganizationUrl="/organization/:slug"
        afterLeaveOrganizationUrl="/onboarding"
        organizationProfileProps={{
          appearance: {
            baseTheme: dark,
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
              "border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 hover:border-purple-500/50 text-slate-100 rounded-xl px-4 py-2.5 shadow-sm transition-all flex items-center justify-between gap-3 text-sm font-semibold",
            organizationPreviewTextContainer: "text-slate-100 font-semibold",
            organizationSwitcherTriggerIcon: "text-slate-400 w-4 h-4",
          },
        }}
      />
    </div>
  );
}
