import ScanClient from "../../components/ScanClient";

export default function ScanPage({
  searchParams,
}: {
  searchParams: { key?: string };
}) {
  const key = (searchParams.key || "").trim();
  const expected = process.env.SCAN_KEY || "";

  return (
    <main style={{ padding: 24 }}>
      <h1>Scanner debug</h1>
      <p>key url: {key || "(vuota)"}</p>
      <p>expected length: {expected.length}</p>
      <p>match: {key === expected ? "SI" : "NO"}</p>
    </main>
  );
}