import ScanClient from "../../components/ScanClient";

export default function ScanPage({
  searchParams,
}: {
  searchParams: { key?: string };
}) {
  const key = (searchParams.key || "").trim();
  const expected = process.env.SCAN_KEY || "";
  const ok = expected && key && key === expected;

  if (!ok) {
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