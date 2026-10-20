import type { Metadata, Viewport } from "next";
import "./globals.css";

// Hotlinked so a profile-picture change shows up without touching this repo.
const AVATAR = "https://avatars.githubusercontent.com/u/99809028";

export const metadata: Metadata = {
  title: "Md Mostafijur Rahman",
  description:
    "Software engineer at Tracxn by day, builder of small useful things the rest of the time. The work, the story, and how to reach me.",
  icons: {
    icon: `${AVATAR}?s=64`,
    apple: `${AVATAR}?s=180`,
  },
};

export const viewport: Viewport = {
  themeColor: "#16171a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
