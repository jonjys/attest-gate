import { useMemo, useState } from "react";
import { DEMO_CSV, runGate, summary, toReceiptCsv, type Verdict } from "@/lib/gate";
import { Download, Globe, Play, Upload } from "lucide-react";

export function GateBoard() {
  const [rows, setRows] = useState<Verdict[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"demo" | "store" | "file" | null>(null);
  const stats = useMemo(() => summary(rows), [rows]);

  function ingest(text: string, src: "demo" | "store" | "file") {
    const next = runGate(text);
    if (!next.length) {
      setError("Empty file or missing header row (need sku, title, price).");
      setRows([]);
      setSource(null);
      return;
    }
    setError(null);
    setSource(src);
    setRows(next);
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => ingest(String(reader.result || ""), "file");
    reader.readAsText(file);
  }

  function download() {
    const blob = new Blob([toReceiptCsv(rows)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "attest-receipt.csv";
    a.click();
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">The gate</p>
      <h2 className="mt-1 font-display text-3xl text-fg">Run a catalog. Get a receipt.</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Client-side. Drop a Shopify product export as-is (Variant SKU, Title,
        Variant Price, Cost per item). Optional: temu_cheaper_pct, return_pct.
        Demo Temu % is fake. Allbirds is real prices, temu 0. Paid work is the
        Temu pass.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold">
          <Upload className="size-4" />
          Choose CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-extrabold text-ink"
          onClick={() => ingest(DEMO_CSV, "demo")}
        >
          <Play className="size-4" />
          Run 20 sample rows
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold"
          onClick={async () => {
            try {
              const res = await fetch("/allbirds-50.csv");
              if (!res.ok) throw new Error("missing catalog");
              ingest(await res.text(), "store");
            } catch {
              setError("Could not load the public Allbirds catalog.");
            }
          }}
        >
          <Globe className="size-4" />
          Run Allbirds (live public catalog)
        </button>
        <button
          type="button"
          disabled={!rows.length}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold disabled:opacity-40"
          onClick={download}
        >
          <Download className="size-4" />
          Download receipt.csv
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-kill">{error}</p> : null}
      {source === "demo" ? (
        <p className="mt-3 text-sm text-muted">
          Synthetic Temu % on purpose — so you can see KILL. Not a live scrape.
        </p>
      ) : null}
      {source === "store" ? (
        <p className="mt-3 text-sm text-muted">
          Real Allbirds prices from their public catalog. Temu % is 0. Most rows KEEP. That is the honest result until someone pays for Temu checks.
        </p>
      ) : null}

      {rows.length ? (
        <>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <span>
              <strong className="text-fg">{stats.n}</strong> rows
            </span>
            <span className="font-extrabold text-primary">KEEP {stats.keep}</span>
            <span className="font-extrabold text-kill">KILL {stats.kill}</span>
            <span>
              Est. leak{" "}
              <strong className="text-fg">€{stats.leak.toLocaleString("en")}</strong>
              /mo if you keep advertising KILL SKUs
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="uppercase tracking-wide text-muted">
                  {[
                    "claim",
                    "sku",
                    "decision",
                    "cause",
                    "landed",
                    "temu%",
                    "return%",
                    "leak/mo",
                    "title",
                  ].map((h) => (
                    <th key={h} className="border-b border-border py-2 pr-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.claimId}>
                    <td className="border-b border-border py-2 pr-3 font-mono">{r.claimId}</td>
                    <td className="border-b border-border py-2 pr-3">{r.sku}</td>
                    <td
                      className={`border-b border-border py-2 pr-3 font-extrabold ${
                        r.decision === "KILL" ? "text-kill" : "text-primary"
                      }`}
                    >
                      {r.decision}
                    </td>
                    <td className="border-b border-border py-2 pr-3">{r.cause}</td>
                    <td className="border-b border-border py-2 pr-3">€{r.landed}</td>
                    <td className="border-b border-border py-2 pr-3">{r.temuCheaperPct}</td>
                    <td className="border-b border-border py-2 pr-3">{r.returnPct}</td>
                    <td className="border-b border-border py-2 pr-3">
                      {r.leakEur ? `€${r.leakEur}` : "—"}
                    </td>
                    <td className="border-b border-border py-2 pr-3">{r.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
