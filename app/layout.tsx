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
  themeColor: "#f5efdf",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="system" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('portfolio-theme');var theme=t==='light'||t==='dark'?t:'system';document.documentElement.dataset.theme=theme;var dark=theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=dark?'#1b1b1b':'#f5efdf'}catch(e){document.documentElement.dataset.theme='system'}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
