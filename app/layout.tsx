import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Md Mostafijur Rahman",
  description:
    "Software engineer at Tracxn, Bengaluru. Builds macOS apps: QuickTodo and Vidp.",
  // Browsers tint favicons in dark mode unless given explicit light and dark
// variants, which would grey out the profile photo. Declaring both keeps it
// showing as-is either way.
icons: {
    icon: [
      { url: "/avatar-32.png", media: "(prefers-color-scheme: light)" },
      { url: "/avatar-32.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/avatar-180.png",
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