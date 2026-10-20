import CopyButton from "./CopyButton";

export default function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div className="mt-5 flex min-w-0 items-center justify-between gap-3 rounded-[7px] border border-amber-line bg-amber-bg px-3 py-[10px]">
      <span className="flex min-w-0 flex-col overflow-x-auto scrollbar-thin [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-line">
        {lines.map((line) => (
          // A command is never re-wrapped: "brew install --cask vidp" breaking
          // across three lines is unreadable and uncopyable. Scroll instead.
          <code
            key={line}
            className="block text-[13px] leading-[1.55] whitespace-pre text-amber"
          >
            {line}
          </code>
        ))}
      </span>
      <CopyButton text={lines.join("\n")} />
    </div>
  );
}
