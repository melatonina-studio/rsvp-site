import { NextResponse } from "next/server";
import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const SHEET_TAB = process.env.GOOGLE_SHEET_TAB || "Sheet1"; // cambia se serve
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!;
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

function must(v: string | undefined, name: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function norm(s: string) {
  return (s || "").toString().trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    must(SHEET_ID, "GOOGLE_SHEET_ID");
    must(CLIENT_EMAIL, "GOOGLE_CLIENT_EMAIL");
    must(PRIVATE_KEY, "GOOGLE_PRIVATE_KEY");

    const body = await req.json().catch(() => ({}));
    const code = (body?.code || "").toString().trim();

    if (!code) {
      return NextResponse.json({ status: "bad_request", error: "Missing code" }, { status: 400 });
    }

    // auth service account
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Leggiamo tutta la tab (per eventi piccoli va benissimo)
    const range = `${SHEET_TAB}!A:Z`;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    const values = (res.data.values || []) as string[][];
    if (values.length < 2) {
      return NextResponse.json({ status: "error", error: "Sheet empty" }, { status: 500 });
    }

    const headers = values[0].map((h) => norm(h));
    const idx = {
      code: headers.indexOf("code"),
      name: headers.indexOf("name"),
      email: headers.indexOf("email"),
      checkedInAt: headers.indexOf("checkedinat"),
    };

    if (idx.code === -1 || idx.checkedInAt === -1) {
      return NextResponse.json(
        { status: "error", error: "Missing required columns: code / checkedInAt" },
        { status: 500 }
      );
    }

    // trova la riga
    let rowIndex = -1; // index in values (0 = header)
    for (let r = 1; r < values.length; r++) {
      const row = values[r] || [];
      if (norm(row[idx.code] || "") === norm(code)) {
        rowIndex = r;
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json({ status: "not_found", code }, { status: 200 });
    }

    const row = values[rowIndex] || [];
    const name = idx.name !== -1 ? (row[idx.name] || "") : "";
    const email = idx.email !== -1 ? (row[idx.email] || "") : "";
    const checkedInAt = row[idx.checkedInAt] || "";

    // già entrato
    if (checkedInAt && checkedInAt.trim() !== "") {
      return NextResponse.json(
        { status: "already", code, name, email, checkedInAt },
        { status: 200 }
      );
    }

    // scrivi timestamp check-in
    const nowIso = new Date().toISOString();

    // calcola la cella da aggiornare: riga = rowIndex+1 (1-based), colonna = idx.checkedInAt
    const colNumber = idx.checkedInAt + 1; // 1-based
    const rowNumber = rowIndex + 1; // 1-based

    // Converti numero colonna -> lettera (A, B, ..., Z, AA...)
    function colToA1(n: number) {
      let s = "";
      while (n > 0) {
        const m = (n - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        n = Math.floor((n - 1) / 26);
      }
      return s;
    }

    const cell = `${SHEET_TAB}!${colToA1(colNumber)}${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: cell,
      valueInputOption: "RAW",
      requestBody: { values: [[nowIso]] },
    });

    return NextResponse.json(
      { status: "ok", code, name, email, checkedInAt: nowIso },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { status: "error", error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}