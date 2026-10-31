import Contact from "@/components/sections/Contact";
import DayJob from "@/components/sections/DayJob";
import Hero from "@/components/sections/Hero";
import Now from "@/components/sections/Now";
import Projects from "@/components/sections/Projects";
import Story from "@/components/sections/Story";
import SiteHeader from "@/components/SiteHeader";
import { FaArrowUp } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="site-shell">
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
      <footer className="page-footer flex flex-wrap items-center justify-between gap-3 py-7 font-mono text-[11px] font-bold uppercase tracking-[.08em] text-muted">
        <span>Made with curiosity · Bengaluru</span>
        <a
          href="#top"
          className="inline-flex min-h-6 items-center gap-1 text-text"
        >
          Back to top{" "}
          <FaArrowUp aria-hidden="true" focusable="false" size="11" />
        </a>
      </footer>
    </div>
  );
}
