import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Resend } from "resend";

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

    if (name.length < 2) {
      return NextResponse.json({ error: "Nome non valido" }, { status: 400 });
    }

    if (!isEmail(email)) {
      return NextResponse.json({ error: "Email non valida" }, { status: 400 });
    }

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const baseUrl = process.env.PUBLIC_BASE_URL;
    const from = process.env.EMAIL_FROM;
    const resendKey = process.env.RESEND_API_KEY;

    if (!sheetId) {
      return NextResponse.json({ error: "Manca GOOGLE_SHEET_ID" }, { status: 500 });
    }

    if (!rawKey) {
      return NextResponse.json({ error: "Manca GOOGLE_SERVICE_ACCOUNT_KEY" }, { status: 500 });
    }

    if (!baseUrl) {
      return NextResponse.json({ error: "Manca PUBLIC_BASE_URL" }, { status: 500 });
    }

    if (!from) {
      return NextResponse.json({ error: "Manca EMAIL_FROM" }, { status: 500 });
    }

    if (!resendKey) {
      return NextResponse.json({ error: "Manca RESEND_API_KEY" }, { status: 500 });
    }

    const resend = new Resend(resendKey);

    let credentials: any;
    try {
      credentials = JSON.parse(rawKey);
    } catch {
      return NextResponse.json(
        { error: "GOOGLE_SERVICE_ACCOUNT_KEY non è JSON valido" },
        { status: 500 }
      );
    }

    const code = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
    const additionalInfo = email;
    const ticketLink = `${baseUrl.replace(/\/$/, "")}/join?t=${encodeURIComponent(code)}`;

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // A: timestamp | B: name | C: email | D: code | E: additional info | F: link
    const values = [[new Date().toISOString(), name, email, code, additionalInfo, ticketLink]];

    const resp = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    const emailResult = await resend.emails.send({
      from,
      to: email,
      subject: "Registrazione confermata — Apri il tuo ticket",
      html: `
        <div style="font-family:Arial,sans-serif; background:#0b0b0f; color:#ffffff; padding:32px;">
          <div style="max-width:560px; margin:0 auto; background:#111118; border:1px solid rgba(255,255,255,0.12); border-radius:16px; padding:24px;">
            <h1 style="margin:0 0 12px; font-size:28px;">Grazie ${name}</h1>
            <p style="margin:0 0 16px; line-height:1.6; color:#d4d4d8;">
              La tua registrazione è stata ricevuta correttamente.
            </p>
            <p style="margin:0 0 24px; line-height:1.6; color:#d4d4d8;">
              Il tuo ticket personale è già pronto. Aprilo dal pulsante qui sotto e conservalo.
            </p>

            <a
              href="${ticketLink}"
              style="
                display:inline-block;
                padding:14px 18px;
                border-radius:12px;
                background:#ffffff;
                color:#000000;
                text-decoration:none;
                font-weight:700;
              "
            >
              Apri ticket
            </a>

            <p style="margin:24px 0 0; font-size:12px; color:#a1a1aa;">
              Se perdi il ticket, potrai recuperarlo da questo link:<br />
              <a href="${ticketLink}" style="color:#ffffff;">${ticketLink}</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("RESEND RESULT:", emailResult);

    return NextResponse.json({
      ok: true,
      code,
      link: ticketLink,
      updatedRange: resp.data.updates?.updatedRange,
    });
  } catch (err: any) {
    console.error("RSVP ERROR:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Errore interno" }, { status: 500 });
  }
}