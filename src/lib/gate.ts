export type RawRow = Record<string, string>;

export type Verdict = {
  claimId: string;
  sku: string;
  title: string;
  price: number;
  cost: number;
  landed: number;
  duty: number;
  temuCheaperPct: number;
  returnPct: number;
  decision: "KEEP" | "KILL";
  cause: string;
  leakEur: number;
};

export const DUTY_EUR = 3;

export const DEMO_CSV = `sku,title,price,cost,temu_cheaper_pct,return_pct
SKU-1044,USB-C braid 2m black,9.90,2.10,35,22
SKU-1081,Yoga block cork,19.00,6.40,0,6
SKU-1102,LED strip 5m RGB,12.90,3.20,40,18
SKU-1120,Wool throw 130x170,59.00,18.00,0,9
SKU-1188,Phone stand fold,8.90,1.80,45,28
SKU-1214,Cast iron skillet 26,39.00,14.00,0,5
SKU-1240,Kids raincoat S,29.00,8.00,10,34
SKU-1266,Espresso tamper 58mm,24.00,7.50,0,4
SKU-1291,Fake-silk pillowcase,14.90,3.10,38,19
SKU-1313,Magnetic lash kit,11.90,2.40,50,31
SKU-1310,Oak cutting board,32.00,11.00,0,7
SKU-1360,Merino beanie,28.00,9.00,0,8
SKU-1388,Car phone mount,13.90,3.00,42,16
SKU-1402,Stoneware mug set 4,34.00,12.00,0,6
SKU-1421,Resistance band pack,16.90,4.20,33,21
SKU-1444,Linen apron,29.00,10.00,0,7
SKU-1470,Wireless earbuds no-name,22.00,5.50,36,27
SKU-1492,Scented candle 220g,18.00,5.00,0,5
SKU-1515,Laptop sleeve 14,15.90,4.00,29,15
SKU-1540,Herb scissors,14.00,4.20,0,4`;

function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

export function parseCsv(text: string): RawRow[] {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const head = splitLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = splitLine(line);
    const o: RawRow = {};
    head.forEach((h, i) => {
      o[h] = (cells[i] || "").trim();
    });
    return o;
  });
}

function num(v: string | undefined): number {
  if (!v) return 0;
  const n = parseFloat(String(v).replace(",", ".").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const RISKY = /silk|lash|mercury|miracle|cure|whitening|cbd gummy/i;

function pick(row: RawRow, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v) return v;
  }
  return "";
}

export function gateRow(row: RawRow, index: number): Verdict {
  const price = num(
    pick(row, ["price", "unit_price", "amount", "variant_price", "variant price"]),
  );
  const cost = num(
    pick(row, ["cost", "cogs", "unit_cost", "variant cost", "cost per item"]),
  );
  const temu =
    num(pick(row, ["temu_cheaper_pct"])) ||
    (pick(row, ["temu_hit"]).toLowerCase() === "yes" ? 30 : 0);
  const ret = num(pick(row, ["return_pct", "est_return_pct", "return_rate"]));
  const landed = +(cost + DUTY_EUR).toFixed(2);
  const title = pick(row, ["title", "name", "product_title", "product title"]);
  const sku =
    pick(row, ["sku", "handle", "variant_sku", "variant sku"]) || `ROW-${index + 1}`;

  const adsDead = price > 0 && landed + price * (ret / 100) > price * 0.55;
  let decision: "KEEP" | "KILL" = "KEEP";
  let cause = "margin_after_landed";
  if (temu >= 25) {
    decision = "KILL";
    cause = "temu_clone";
  } else if (ret >= 25) {
    decision = "KILL";
    cause = "return_trap";
  } else if (RISKY.test(title)) {
    decision = "KILL";
    cause = "claim_risk";
  } else if (adsDead) {
    decision = "KILL";
    cause = "landed_kills_ads";
  }

  const leakEur =
    decision === "KILL"
      ? +Math.max(price * 0.35 * 40, DUTY_EUR * 12).toFixed(0)
      : 0;

  return {
    claimId: `att_${String(index + 1).padStart(4, "0")}`,
    sku,
    title,
    price,
    cost,
    landed,
    duty: DUTY_EUR,
    temuCheaperPct: temu,
    returnPct: ret,
    decision,
    cause,
    leakEur,
  };
}

export function runGate(text: string): Verdict[] {
  return parseCsv(text).map(gateRow);
}

export function toReceiptCsv(rows: Verdict[]): string {
  const head = [
    "claim_id",
    "sku",
    "decision",
    "cause",
    "price",
    "cost",
    "landed_eu_eur",
    "temu_cheaper_pct",
    "return_pct",
    "leak_eur_mo",
    "title",
  ];
  const lines = rows.map((r) =>
    [
      r.claimId,
      r.sku,
      r.decision,
      r.cause,
      r.price,
      r.cost,
      r.landed,
      r.temuCheaperPct,
      r.returnPct,
      r.leakEur,
      `"${r.title.replace(/"/g, '""')}"`,
    ].join(","),
  );
  return [head.join(","), ...lines].join("\n");
}

export function summary(rows: Verdict[]) {
  const keep = rows.filter((r) => r.decision === "KEEP").length;
  const kill = rows.length - keep;
  const leak = rows.reduce((s, r) => s + r.leakEur, 0);
  return { keep, kill, leak, n: rows.length };
}
