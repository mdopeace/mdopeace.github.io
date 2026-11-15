import ThemeToggle from "./ThemeToggle";
import { Inline } from "./ui/Layout";
import { Surface } from "./ui/Surface";
import { Link } from "./ui/Link";
const links = [
  ["Story", "#story"],
  ["Work", "#work"],
  ["Experience", "#experience"],
  ["Now", "#now"],
  ["Contact", "#contact"],
];
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
            Md
          </Link>
          <Inline
            gap={{ base: 3, md: 6 }}
            justify={{ base: "between", md: "center" }}
            wrap={false}
            className="navigation-links"
          >
            {links.map(([label, href]) => (
              <Link href={href} key={href} size="sm" variant="nav">
                {label}
              </Link>
            ))}
          </Inline>
          <ThemeToggle />
        </Inline>
      </Surface>
    </nav>
  );
}
