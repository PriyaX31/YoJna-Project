"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { PenBox, ChartArea } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* App Logo on the left top side of screen */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
          <Logo />
        </Link>

        {/* Action buttons with subtle spacing between them */}
        <div className="flex items-center gap-3">
          <Link href="/project/create">
            <Button
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm shadow-purple-500/20 transition-all border-0"
            >
              <PenBox className="h-4 w-4" />
              <span>Create Project</span>
            </Button>
          </Link>

          {/* Signed In controls: UserButton with custom 'My Organization' menu item */}
          <SignedIn>
            <UserButton
              appearance={{
                baseTheme: dark,
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label="My Organization"
                  labelIcon={<ChartArea className="h-4 w-4" />}
                  href="/onboarding"
                />
                <UserButton.Action label="manageAccount" />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>

          {/* Replaced Sign In / Sign Up with a single Log In button */}
          <SignedOut>
            <SignInButton forceRedirectUrl="/onboarding">
              <Button variant="outline">
                Log In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Header;