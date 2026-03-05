import Scanner from "../../components/Scanner";

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
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1>Scanner</h1>
      <p style={{ opacity: 0.8 }}>Punta la camera sul QR.</p>

      <Scanner onResult={(text) => console.log("QR letto:", text)} />
    </main>
  );
}