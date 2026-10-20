import Section from "../Section";

// p sits in column 2 — otherwise a second paragraph lands in the number column.
const STEP_P = "col-start-2 text-[15px] leading-[1.6] text-muted";

export default function Story() {
  return (
    <Section label="How this happened">
      <ol className="grid gap-4">
        <li className="grid grid-cols-[2.5rem_minmax(0,1fr)]">
          <span aria-hidden="true" className="text-[14px] text-faint">
            01
          </span>
          <p className={STEP_P}>
            It starts with films. And with the search for one worth sitting
            through. Streaming splits across separate subscriptions, and
            whatever is free is buried in ads and buffering — so I download,
            and watch it dark, on a laptop.
          </p>
        </li>
        <li className="grid grid-cols-[2.5rem_minmax(0,1fr)]">
          <span aria-hidden="true" className="text-[14px] text-faint">
            02
          </span>
          <p className={STEP_P}>
            Which made the player the bottleneck. None of them felt like
            they belonged on a Mac. So I built one that did — native,
            keyboard driven, mine.
          </p>
        </li>
        <li className="grid grid-cols-[2.5rem_minmax(0,1fr)]">
          <span aria-hidden="true" className="text-[14px] text-faint">
            03
          </span>
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
