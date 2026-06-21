import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-sodium">
        [ 404 ]
      </p>
      <h1 className="mt-6 font-display text-[clamp(3rem,14vw,12rem)] font-bold leading-[0.82] tracking-tighter">
        Not Found
      </h1>
      <p className="mt-6 max-w-md font-serif text-lg italic text-bone/70">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-10 font-mono text-xs text-muted-foreground transition-colors hover:text-sodium"
      >
        ← Back home
      </Link>
    </section>
  );
}
