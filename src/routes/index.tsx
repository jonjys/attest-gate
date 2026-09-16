import { createFileRoute, Link } from "@tanstack/react-router";
import { GateBoard } from "@/components/gate-board";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold tracking-tight">ATTEST</p>
        <Link
          to="/buy"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-extrabold text-ink"
        >
          Book Snap $99 / Audit $4,900
        </Link>
      </header>

      <p className="mt-14 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Catalog gate · EU landed
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[1.05] text-fg sm:text-6xl">
        Nothing ships until it has an ID and a yes.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        Temu clones, the €3 duty, and returns eat ad spend. ATTEST is the receipt:
        KEEP or KILL, cause, landed cost. The toy below is free. The ten-day job
        on your real catalog is $4,900.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="#gate"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold"
        >
          Run the sample
        </a>
        <Link
          to="/buy"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-extrabold text-ink"
        >
          Pay for the real catalog
        </Link>
      </div>

      <div id="gate" className="mt-14">
        <GateBoard />
      </div>

      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
          {
            k: "01",
            t: "Claim",
            d: "Every SKU gets a claim ID. Without an ID there is nothing to insure or kill in ads.",
          },
          {
            k: "02",
            t: "Gate",
            d: "KEEP or KILL with a cause: Temu clone, return trap, duty that eats ROAS, claim risk.",
          },
          {
            k: "03",
            t: "Landed",
            d: "Cost + €3 EU duty + return drag. If ads cannot survive that number, the row dies.",
          },
        ].map((x) => (
          <article key={x.k} className="rounded-2xl border border-border p-5">
            <p className="text-xs font-semibold text-primary">{x.k}</p>
            <h3 className="mt-2 font-display text-2xl">{x.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{x.d}</p>
          </article>
        ))}
      </section>

      <p className="mt-16 text-sm text-muted">
        Nytto Labs · hello@nyttolabs.com · This gate is the
        sample. Paid work is a receipt on your export.
      </p>
    </div>
  );
}
