import CopyButton from "./CopyButton";

export default function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div className="mt-5 flex min-w-0 items-center justify-between gap-3 rounded-none border-2 border-ink bg-amber-bg px-3 py-2.5 shadow-[3px_3px_0_var(--ink)]">
      <span className="flex min-w-0 flex-col overflow-x-auto scrollbar-thin [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-line">
        {lines.map((line) => (
          <code
            key={line}
            className="code-command block text-[13px] leading-[1.55] whitespace-pre"
          >
            {line}
          </code>
        ))}
      </span>
      <CopyButton text={lines.join("\n")} />
    </div>
  );
}
