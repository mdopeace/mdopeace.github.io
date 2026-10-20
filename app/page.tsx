import Contact from "@/components/sections/Contact";
import DayJob from "@/components/sections/DayJob";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Story from "@/components/sections/Story";

export default function Home() {
  return (
    <div className="mx-auto max-w-[980px] px-6">
      <Hero />
      <main>
        <Projects />
        <Story />
        <DayJob />
        <Contact />
      </main>
    </div>
  );
}
