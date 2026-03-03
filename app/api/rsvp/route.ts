import { NextResponse } from "next/server";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const people = Number(body?.people || 1);
  const status = String(body?.status || "si").trim();

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Nome non valido" }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Email non valida" }, { status: 400 });
  }
  if (!Number.isFinite(people) || people < 1 || people > 10) {
    return NextResponse.json({ error: "Numero persone non valido" }, { status: 400 });
  }
  if (!["si", "forse", "no"].includes(status)) {
    return NextResponse.json({ error: "Stato non valido" }, { status: 400 });
  }

  // TODO: qui salveremo su DB / Google Sheet / Vercel KV
  // Per adesso: OK e basta
  return NextResponse.json({ ok: true });
}