import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const { code } = await req.json();

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

  const headers = rows[0];

  const codeIndex = headers.indexOf("code");
  const nameIndex = headers.indexOf("name");
  const emailIndex = headers.indexOf("email");
  const checkedIndex = headers.indexOf("checkedInAt");

  for (let i = 1; i < rows.length; i++) {

    const row = rows[i];

    if (row[codeIndex] === code) {

      if (row[checkedIndex]) {
        return NextResponse.json({
          status: "already",
          name: row[nameIndex],
          email: row[emailIndex]
        });
      }

      const now = new Date().toISOString();

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Sheet1!${String.fromCharCode(65 + checkedIndex)}${i + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[now]],
        },
      });

      return NextResponse.json({
        status: "ok",
        name: row[nameIndex],
        email: row[emailIndex]
      });
    }
  }

  return NextResponse.json({
    status: "not_found"
  });

}