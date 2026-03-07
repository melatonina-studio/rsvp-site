import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {

  const sheetId = process.env.GOOGLE_SHEET_ID!;
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  const TAB = "'rsvp 27 marzo'";
  const range = `${TAB}!A:Z`;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const rows = response.data.values || [];

  if (!rows.length) {
    return NextResponse.json({ count: 0, entries: [] });
  }

  const headers = rows[0];

  const nameIndex = headers.indexOf("name");
  const emailIndex = headers.indexOf("email");
  const checkedIndex = headers.indexOf("checkedInAt");

  const entries = rows
    .slice(1)
    .filter((row) => row[checkedIndex])
    .map((row) => ({
      name: row[nameIndex] || "",
      email: row[emailIndex] || "",
      checkedInAt: row[checkedIndex] || "",
    }));

  return NextResponse.json({
    count: entries.length,
    entries,
  });
}