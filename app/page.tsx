"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RsvpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      people: Number(formData.get("people") || 1),
      status: String(formData.get("status") || "si"),
    };

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Errore invio RSVP");
      }

      router.push("/grazie");
    } catch (err: any) {
      setError(err?.message || "Errore imprevisto");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.55)",
          transform: "scale(1.02)",
          objectPosition: "center 40%",
        }}
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>
        {/* LOGO */}
      <div
        style={{
          position: "absolute",
          top: "30px",
          left: "50%",
          padding: "20px",
          transform: "translateX(-50%)",
          zIndex: 20
        }}
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={180}
          height={60}
          priority
        />
        </div>
      {/* Overlay contenuto */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 16,
            padding: 20,
            background: "rgba(10,10,14,0.42)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
            color: "#fff",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: -0.5 }}>
            Registarti per avere la riduzione all'entrata
          </h1>
          <p style={{ marginTop: 8, opacity: 0.85 }}>
            Conferma la tua partecipazione. Niente spam, solo tekno!!!
          </p>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 14 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, opacity: 0.85 }}>Nome</span>
              <input type="text" name="website" style={{ display: "none" }} />
              <input
                name="name"
                required
                placeholder="Nome e cognome"
                style={inputStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, opacity: 0.85 }}>Email</span>
              <input
                name="email"
                required
                type="email"
                placeholder="nome@email.com"
                style={inputStyle}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, opacity: 0.85 }}>Persone</span>
                <input
                  name="people"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={1}
                  style={inputStyle}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, opacity: 0.85 }}>Parteciperai?</span>
                <select name="status" defaultValue="si" style={inputStyle}>
                  <option value="si">Sì</option>
                  <option value="forse">Forse</option>
                  <option value="no">No</option>
                </select>
              </label>
            </div>

            {error && (
              <div style={{ padding: 10, borderRadius: 12, background: "rgba(255,0,0,0.12)", border: "1px solid rgba(255,0,0,0.25)" }}>
                <span style={{ fontSize: 13 }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.18)",
                background: loading ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.16)",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {loading ? "Invio..." : "Conferma"}
            </button>

            <p style={{ margin: 0, fontSize: 12, opacity: 0.75 }}>
              Inviando accetti che useremo i dati solo per la gestione dell’evento.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(0,0,0,0.25)",
  color: "#fff",
  outline: "none",
};

