import Section from "../Section";

// p sits in column 2 — otherwise a second paragraph lands in the number column.
const STEP_P = "mt-5 text-[15px] leading-[1.7] text-muted";

export default function Story() {
  return (
    <Section label="How I think" id="story" index="01">
      <ol className="story-grid grid gap-4 md:grid-cols-3">
        <li className="story-card comic-panel">
          <h3 className="comic-label">01 / Notice</h3>
          <p className={STEP_P}>
            It starts with films. And with the search for one worth sitting
            through. Streaming splits across separate subscriptions, and
            whatever is free is buried in ads and buffering — so I download,
            and watch it dark, on a laptop.
          </p>
        </li>
        <li className="story-card comic-panel">
          <h3 className="comic-label">02 / Make</h3>
          <p className={STEP_P}>
            Which made the player the bottleneck. None of them felt like
            they belonged on a Mac. So I built one that did — native,
            keyboard driven, mine.
          </p>
        </li>
        <li className="story-card comic-panel">
          <h3 className="comic-label">03 / Refine</h3>
          <p className={STEP_P}>
            And then it started over. The first version shipped, and I
            wasn&apos;t satisfied with it. The fixes kept arriving and
            evaporating mid-task — the next idea, gone before I could write
            it down. So I built somewhere to put them.
          </p>
          <p className={`${STEP_P} mt-3`}>
            With the list finally captured, I can go back and finish what I
            started.
          </p>
        </li>
      </ol>
    </Section>
  );
}
