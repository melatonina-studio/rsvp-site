"use client";

import { useEffect, useState } from "react";
import ScanClient from "../../components/ScanClient";

export default function ScanPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = (params.get("key") || "").trim();

    const expected = process.env.NEXT_PUBLIC_SCAN_KEY || "";
    setAllowed(!!expected && !!key && key === expected);
  }, []);

  if (allowed === null) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Scanner</h1>
        <p>Controllo accesso...</p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Scanner</h1>
        <p>Accesso negato</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
      <h1>Scanner</h1>
      <p style={{ opacity: 0.8 }}>Scansiona il QR (codice puro).</p>
      <ScanClient />
    </main>
  );
}