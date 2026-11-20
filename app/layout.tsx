import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata, Viewport } from "next";
import { withBasePath } from "@/lib/withBasePath";
import "./globals.css";

const socialImage = {
  url: withBasePath("/opengraph-image.png"),
  width: 1200,
  height: 630,
  alt: readFileSync(join(process.cwd(), "app/opengraph-image.alt.txt"), "utf8").trim(),
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mdopeace.github.io"),
  alternates: { canonical: "/" },
  robots: process.env.NEXT_PUBLIC_BASE_PATH
    ? { index: false, follow: false }
    : undefined,
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
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Md Mostafijur Rahman",
    description:
      "Software engineer at Tracxn by day, builder of small useful things the rest of the time. The work, the story, and how to reach me.",
    images: [socialImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#f5efdf",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;try{t=localStorage.getItem('portfolio-theme')}catch(e){}var theme=t==='light'||t==='dark'?t:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=theme;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=theme==='dark'?'#1b1b1b':'#f5efdf'})()`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
