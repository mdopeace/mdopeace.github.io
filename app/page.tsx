import Contact from "@/components/sections/Contact";
import DayJob from "@/components/sections/DayJob";
import Hero from "@/components/sections/Hero";
import Now from "@/components/sections/Now";
import Projects from "@/components/sections/Projects";
import Story from "@/components/sections/Story";
import SiteHeader from "@/components/SiteHeader";

export default function Home() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <Hero />
      <main>
        <Story />
        <Projects />
        <DayJob />
        <Now />
        <Contact />
      </main>
      <footer className="page-footer flex flex-wrap items-center justify-between gap-3 border-t-2 border-line py-7 font-mono text-[11px] font-bold uppercase tracking-[.08em] text-muted">
        <span>Made with curiosity · Bengaluru</span>
        <a href="#top" className="text-text">Back to top ↑</a>
      </footer>
    </div>
  );
}
