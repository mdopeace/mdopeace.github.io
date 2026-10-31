import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mdopeace.github.io"),
  title: "Md Mostafijur Rahman",
  description:
    "Software engineer at Tracxn by day, builder of small useful things the rest of the time. The work, the story, and how to reach me.",
  openGraph: {
    type: "website",
    url: "https://mdopeace.github.io/",
    title: "Md Mostafijur Rahman",
    description:
      "Software engineer at Tracxn by day, builder of small useful things the rest of the time. The work, the story, and how to reach me.",
    siteName: "Md Mostafijur Rahman",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Md Mostafijur Rahman — software engineer and builder of small useful things",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Md Mostafijur Rahman",
    description:
      "Software engineer at Tracxn by day, builder of small useful things the rest of the time. The work, the story, and how to reach me.",
    images: ["/opengraph-image.png"],
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
