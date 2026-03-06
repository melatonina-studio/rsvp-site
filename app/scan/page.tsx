import ScanClient from "../../components/ScanClient";

export default function ScanPage() {
  return (
    <main style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
      <h1>Scanner</h1>
      <p style={{ opacity: 0.8 }}>Scansiona il QR (codice puro).</p>
      <ScanClient />
    </main>
  );
}