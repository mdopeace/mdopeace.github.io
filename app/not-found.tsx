import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[980px] flex-col items-center justify-center px-page text-center">
      <p className="text-[11px] font-semibold tracking-[0.1em] text-faint">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-text">
        That page is not here
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        <Link href="/" className="text-amber underline underline-offset-4">
          Go back to the portfolio
        </Link>
      </p>
    </main>
  );
}