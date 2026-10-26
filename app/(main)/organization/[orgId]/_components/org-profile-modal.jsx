"use client";

import React, { useState } from "react";
import { OrganizationProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function OrgProfileModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-semibold h-9 border-border/80 shadow-xs hover:bg-muted/60"
        >
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Organization Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none flex justify-center items-center">
        <OrganizationProfile
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: "w-full max-w-3xl",
              card: "shadow-2xl border border-border bg-card",
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
