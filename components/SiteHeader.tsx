import ThemeToggle from "./ThemeToggle";
import { Navbar } from "@mdopeace/ui/Navbar";
import { Link } from "@mdopeace/ui/Link";
import SectionLinks from "./portfolio/SectionLinks";
export default function SiteHeader() {
  return (
    <Navbar
      className="site-nav"
      label="Main navigation"
      brand={
          <Link
            href="#top"
            variant="emphasis"
            size="sm"
            aria-label="Md Mostafijur Rahman, home"
          >
            <span className="brand-wordmark">Md</span>
          </Link>
      }
      actions={<ThemeToggle />}
    >
      <SectionLinks />
    </Navbar>
  );
}
