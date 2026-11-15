import Contact from "@/components/sections/Contact";
import DayJob from "@/components/sections/DayJob";
import Hero from "@/components/sections/Hero";
import Now from "@/components/sections/Now";
import Projects from "@/components/sections/Projects";
import Story from "@/components/sections/Story";
import SiteHeader from "@/components/SiteHeader";
import { Container, Inline } from "@/components/ui/Layout";
import { Link } from "@/components/ui/Link";
import { Text } from "@/components/ui/Typography";
import { FaArrowUp } from "react-icons/fa6";

export default function Home() {
  return (
    <Container>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <Hero />
      <main id="main-content" tabIndex={-1}>
        <Story />
        <Projects />
        <DayJob />
        <Now />
        <Contact />
      </main>
      <footer className="page-footer">
        <Inline justify="between" gap={3}>
          <Text size="caption" font="mono" tone="muted">
            Made with curiosity · Bengaluru
          </Text>
          <Link href="#top" size="sm" endIcon={<FaArrowUp />}>
            Back to top
          </Link>
        </Inline>
      </footer>
    </Container>
  );
}
