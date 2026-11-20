import type { Metadata } from "next";
import { withBasePath } from "@/lib/withBasePath";
import Playground from "./Playground";

const title = "Component Playground · Md Mostafijur Rahman";
const description =
  "Explore the React building blocks behind my portfolio. Try component variants, test keyboard interactions, and copy working examples.";
const socialImage = withBasePath("/opengraph-image.png");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/playground/" },
  openGraph: {
    title,
    description,
    url: "https://mdopeace.github.io/playground/",
    type: "website",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

export default function PlaygroundPage() {
  return <Playground />;
}
