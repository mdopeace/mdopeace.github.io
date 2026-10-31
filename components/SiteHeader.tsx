import ThemeToggle from "./ThemeToggle";

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
      <div className="site-nav-inner">
        <a href="#top" aria-label="Md Mostafijur Rahman, home" className="font-mono text-sm font-black tracking-[-.08em] text-text no-underline">
          Md<span className="text-amber">✳</span>
        </a>
        <div className="nav-links">
          {links.map(([label, href]) => (
            <a href={href} key={href}>{label}</a>
          ))}
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
