import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { checkUser } from "@/lib/checkUser";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "YoJna",
  description: "Project Management App",
};

export default async function RootLayout({ children }) {
  await checkUser();

  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" suppressHydrationWarning className="h-full">
        <body className={`${inter.className} min-h-screen flex flex-col`}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Header />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Toaster richColors />
            <footer className="bg-red-700 py-3 mt-auto">
              <div className="container mx-auto px-4 text-center text-white text-sm">
                <p>MADE BY PAKSH ♡</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}