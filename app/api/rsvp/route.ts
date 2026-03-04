import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body?.website) {
  return NextResponse.json({ ok: true });
}
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

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const values = [[new Date().toISOString(), body?.name ?? "", body?.email ?? "", body?.people ?? 1, body?.status ?? "si"]];

    const resp = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return NextResponse.json({ ok: true, updatedRange: resp.data.updates?.updatedRange });
  } catch (err: any) {
    console.error("RSVP ERROR:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Errore interno" }, { status: 500 });
  }
}