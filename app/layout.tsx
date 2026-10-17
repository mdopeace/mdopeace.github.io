import type { Metadata, Viewport } from "next";
import "./globals.css";

// Hotlinked to the GitHub avatar CDN so a profile-picture change shows up
// without touching this repo. ?s= keeps it a 6KB icon instead of a 68KB
// photo. Declared for both colour schemes because browsers tint favicons in
// dark mode, which would grey out the picture.
const avatar = "https://avatars.githubusercontent.com/u/99809028";

export const metadata: Metadata = {
  title: "Md Mostafijur Rahman",
  description:
    "Software engineer at Tracxn, Bengaluru. Builds macOS apps: QuickTodo and Vidp.",
  icons: {
    icon: [
      { url: `${avatar}?s=64`, media: "(prefers-color-scheme: light)" },
      { url: `${avatar}?s=64`, media: "(prefers-color-scheme: dark)" },
    ],
    apple: `${avatar}?s=180`,
  },
};

export const viewport: Viewport = {
  themeColor: "#16171a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}