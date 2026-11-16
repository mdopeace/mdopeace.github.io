import type { Metadata } from "next";
import Playground from "./Playground";

const title = "Component Playground · Md Mostafijur Rahman";
const description =
  "Explore the React building blocks behind my portfolio. Try component variants, test keyboard interactions, and copy working examples.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/playground/" },
  openGraph: {
    title,
    description,
    url: "https://mdopeace.github.io/playground/",
    type: "website",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image.png"],
  },
};

export default function PlaygroundPage() {
  return <Playground />;
}
