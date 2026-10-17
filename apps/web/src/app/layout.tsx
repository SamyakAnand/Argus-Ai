import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import "./argus.css";

export const metadata: Metadata = {
  title: "ARGUS AI — Enterprise Knowledge Intelligence",
  description: "See beyond data. Discover the truth. Explore evidence-led analysis and the ARGUS AI knowledge intelligence prototype.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ClerkProvider localization={{
    signIn: { start: { title: "Sign in to ARGUS AI", subtitle: "Continue to your evidence workspace." } },
    signUp: { start: { title: "Create your ARGUS AI account", subtitle: "Set up your personal evidence workspace." } },
  }}>{children}</ClerkProvider></body></html>;
}
