import ThemeToggle from "./ThemeToggle";
import { Inline } from "@mdopeace/ui/Layout";
import { Surface } from "@mdopeace/ui/Surface";
import { Link } from "@mdopeace/ui/Link";
import SectionLinks from "./portfolio/SectionLinks";
export default function SiteHeader() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Surface padding={3}>
        <Inline gap={4} wrap={false} className="navigation-layout">
          <Link
            href="#top"
            variant="emphasis"
            size="sm"
            aria-label="Md Mostafijur Rahman, home"
          >
            <span className="brand-wordmark">Md</span>
          </Link>
          <SectionLinks />
          <ThemeToggle />
        </Inline>
      </Surface>
    </nav>
  );
}
