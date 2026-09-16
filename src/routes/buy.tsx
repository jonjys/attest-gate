import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/buy")({ component: Buy });

function Buy() {
  const [store, setStore] = useState("");
  const [email, setEmail] = useState("");
  const [skus, setSkus] = useState("800");
  const [tier, setTier] = useState<"snap" | "audit">("snap");

  const href = useMemo(() => {
    const price = tier === "snap" ? "$99" : "$4,900";
    const name = tier === "snap" ? "ATTEST Snap (20 SKUs, 48h)" : "ATTEST catalog audit (10 days)";
    const body = [
      `I want ${name} — ${price}.`,
      `Store: ${store || "(url)"}`,
      `Email: ${email || "(email)"}`,
      `SKU count: ${skus}`,
      "",
      "Shopify Admin → Products → Export CSV. I'll map Variant SKU / Title / Variant Price.",
    ].join("\n");
    return `mailto:hello@nyttolabs.com?subject=${encodeURIComponent(
      `${name} — ${price}`,
    )}&body=${encodeURIComponent(body)}`;
  }, [store, email, skus, tier]);

  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-6">
      <Link to="/" className="text-sm text-muted">
        ← Gate
      </Link>
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Paid work
      </p>
      <h1 className="mt-2 font-display text-4xl leading-tight">Two prices. Same receipt.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Shopify export in. Claim IDs out. No app install — Admin → Products →
        Export.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setTier("snap")}
          className={`rounded-2xl border p-4 text-left ${
            tier === "snap" ? "border-primary" : "border-border"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Snap</p>
          <p className="mt-1 font-display text-3xl">$99</p>
          <p className="mt-2 text-sm text-muted">20 SKUs, 48h, annotated CSV. Impulse yes.</p>
        </button>
        <button
          type="button"
          onClick={() => setTier("audit")}
          className={`rounded-2xl border p-4 text-left ${
            tier === "audit" ? "border-primary" : "border-border"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Audit</p>
          <p className="mt-1 font-display text-3xl">$4,900</p>
          <p className="mt-2 text-sm text-muted">Full catalog, 10 days, walkthrough.</p>
        </button>
      </div>

      <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
          Store URL
          <input
            className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm text-fg"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="https://"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
          Your email
          <input
            type="email"
            className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm text-fg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ops@store.com"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
          Approx SKUs
          <input
            className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm text-fg"
            value={skus}
            onChange={(e) => setSkus(e.target.value)}
          />
        </label>
        <a
          href={href}
          className="flex min-h-12 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-ink"
        >
          Email hello@nyttolabs.com
        </a>
      </form>
    </div>
  );
}
