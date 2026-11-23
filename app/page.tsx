import AnalyticsConsent from "@/components/analytics/AnalyticsConsent";
import Contact from "@/components/sections/Contact";
import DayJob from "@/components/sections/DayJob";
import Hero from "@/components/sections/Hero";
import Now from "@/components/sections/Now";
import Projects from "@/components/sections/Projects";
import Story from "@/components/sections/Story";
import SiteHeader from "@/components/SiteHeader";
import { HuntLog, StickerHunt } from "@/components/portfolio/StickerHunt";
import { SectionNavigation } from "@/components/portfolio/SectionNavigation";
import { Container, Inline } from "@mdopeace/ui/Layout";
import { Link } from "@mdopeace/ui/Link";
import { Text } from "@mdopeace/ui/Typography";
import { FaArrowUp } from "react-icons/fa6";

const siteUrl = "https://mdopeace.github.io/";
const name = "Md Mostafijur Rahman";
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name,
      url: siteUrl,
      jobTitle: "Software Engineer",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bengaluru",
      },
      sameAs: [
        "https://github.com/mdopeace",
        "https://www.linkedin.com/in/mdopeace",
      ],
    },
    {
      "@type": "WebSite",
      name,
      url: siteUrl,
    },
  ],
};

export default function Home() {
  return (
    <Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SectionNavigation />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <StickerHunt>
        <SiteHeader />
        <Hero />
        <main id="main-content" tabIndex={-1}>
          <Story />
          <Projects />
          <DayJob />
          <Now />
          <Contact />
          <HuntLog />
        </main>
      </StickerHunt>
      <footer className="page-footer">
        <Inline justify="between" gap={4} className="footer-layout">
          <Text size="caption" font="mono" tone="muted">
            Made with curiosity · Bengaluru
          </Text>
          <Link href="#top" size="sm" endIcon={<FaArrowUp />}>
            Back to top
          </Link>
        </Inline>
        <AnalyticsConsent />
      </footer>
    </Container>
  );
}
