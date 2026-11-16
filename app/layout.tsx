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
        alt: "Md Mostafijur Rahman — Software engineer and maker in Bengaluru. Building small, useful things. A cream and yellow card with a Tetris handheld.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Md Mostafijur Rahman",
    description:
      "Software engineer at Tracxn by day, builder of small useful things the rest of the time. The work, the story, and how to reach me.",
    images: [
      {
        url: "/opengraph-image.png",
        alt: "Md Mostafijur Rahman — Software engineer and maker in Bengaluru. Building small, useful things. A cream and yellow card with a Tetris handheld.",
      },
    ],
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
