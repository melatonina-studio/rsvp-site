import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // honeypot anti-bot
    if (body?.website) {
      return NextResponse.json({ ok: true });
    }

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();

    if (name.length < 2) return NextResponse.json({ error: "Nome non valido" }, { status: 400 });
    if (!isEmail(email)) return NextResponse.json({ error: "Email non valida" }, { status: 400 });

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!sheetId) return NextResponse.json({ error: "Manca GOOGLE_SHEET_ID" }, { status: 500 });
    if (!rawKey) return NextResponse.json({ error: "Manca GOOGLE_SERVICE_ACCOUNT_KEY" }, { status: 500 });

    let credentials: any;
    try {
      credentials = JSON.parse(rawKey);
    } catch {
      return NextResponse.json({ error: "GOOGLE_SERVICE_ACCOUNT_KEY non è JSON valido" }, { status: 500 });
    }

    // ✅ unique code per QR ingresso (10 char esadecimali, uppercase)
    const code = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
    const baseUrl = process.env.PUBLIC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: "Manca PUBLIC_BASE_URL" }, { status: 500 });
    }

    const link = `${baseUrl.replace(/\/$/, "")}/join?t=${encodeURIComponent(code)}`;
    
    // ✅ additional info: ci mettiamo l'email (come vuoi tu)
    const additionalInfo = email;

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ✅ timestamp | name | email | unique code | additional info
    const values = [[new Date().toISOString(), name, email, code, additionalInfo, link]];

    const resp = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    // ✅ ritorna code al client (per il QR in /join)
    return NextResponse.json({ ok: true, code, updatedRange: resp.data.updates?.updatedRange });
  } catch (err: any) {
    console.error("RSVP ERROR:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Errore interno" }, { status: 500 });
  }
}
