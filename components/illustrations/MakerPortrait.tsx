type MakerPortraitProps = {
  x: number;
  y: number;
  scale?: number;
};

/** Shared angular face and hoodie, sized to fit either scene. */
export default function MakerPortrait({ x, y, scale = 1 }: MakerPortraitProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Hoodie shoulders */}
      <path
        fill="#263b46"
        d="M4 220v-43q0-38 37-52l19-7h30l19 7q37 14 37 52v43z"
      />
      <path fill="#344f5b" d="m26 169 34-39h30l34 39-10 51H36z" />
      <path fill="#263b46" d="m60 130 15 14 15-14 14 90H46z" />
      <path fill="var(--accent)" d="m68 151 7 7 7-7 5 28H63z" />
      <path
        fill="none"
        d="M75 160v44m-7-34 7 9 7-9"
        stroke="#e9dfc9"
        strokeWidth="3"
      />

      {/* Hood sits behind the face and covers the hair completely. */}
      <path
        fill="#172a34"
        d="M10 112V68Q10 7 75 4q65 3 65 64v44l-22 25V69q0-39-43-39T32 69v68z"
      />
      <path
        fill="none"
        stroke="#59717b"
        strokeWidth="4"
        d="M30 105V69q0-45 45-45t45 45v36"
      />

      {/* The same angular jaw, glasses and short stubble are reused in both scenes. */}
      <path
        fill="#d99268"
        d="M27 52 44 31l31-8 31 8 17 21-4 42-13 35-31 22-31-22-13-35z"
      />
      <path
        fill="#d99268"
        d="M27 62q-12 0-12 14t15 17m90-31q12 0 12 14t-15 17"
      />
      <path
        fill="#17232a"
        d="M27 59h42v24q0 9-9 9H38q-11 0-11-11zm54 0h42v22q0 11-11 11H90q-9 0-9-9z"
      />
      <path
        fill="none"
        stroke="var(--ink)"
        strokeWidth="5"
        d="M68 67q7-5 14 0"
      />
      <path fill="none" stroke="#5b392b" strokeWidth="3" d="m77 87-5 11 7 2" />
      <path
        fill="#352721"
        stroke="none"
        d="M53 107q10-8 22-1 12-7 22 1-4 10-13 8l-9-3-9 3q-9 2-13-8"
      />
      <path
        fill="none"
        stroke="#5b392b"
        strokeWidth="2.5"
        d="m48 119 2 2m11 3-1 2m29 0 2-2m10-5 2-2m-31 16 2 1m8 0 2-1"
      />
    </g>
  );
}
