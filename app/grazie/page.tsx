export default function GraziePage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 720 }}>
        <h1 style={{ margin: 0, fontSize: 34 }}>Registrazione completata</h1>
        <p style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.6 }}>
          Qui inserirò i contenuti (link, lineup, info, ecc.). Per ora è una pagina placeholder.
        </p>

        <div style={{ marginTop: 18, padding: 16, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
          <strong>Prossimi contenuti possibili:</strong>
          <ul style={{ marginTop: 10 }}>
            <li>Line-up + orari</li>
            <li>Location + map</li>
            <li>Regole d’ingresso</li>
            <li>Link ticket (se serve)</li>
            <li>Nel frattempo ci succhiano tutti l'uccello</li>
          </ul>
        </div>
      </div>
    </main>
  );
}