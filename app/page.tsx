"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // errore generale (banner rosso)
  const [error, setError] = useState<string | null>(null);

  // errori campo-specifici (flag)
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // reset errori
    setError(null);
    setEmailError(null);
    setNameError(null);

    setLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      status: String(fd.get("status") || "si").trim(),
      website: String(fd.get("website") || "").trim(), // honeypot anti-bot
    };

    // Validazione client
    if (payload.name.length < 2) {
      const msg = "Inserisci un nome valido.";
      setNameError(msg);
      setError(msg);
      setLoading(false);
      return;
    }

    if (!isEmail(payload.email)) {
      const msg = "Inserisci un’email valida.";
      setEmailError(msg);
      setError(msg);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Errore invio RSVP");
        setLoading(false);
        return;
      }

      router.push("/join");
    } catch {
      setError("Errore di rete. Riprova.");
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <video className={styles.video} autoPlay muted loop playsInline>
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      <div className={styles.vignette} />

      <div className={styles.logoWrap}>
        <Image
          src="/logo.png"
          alt="Logo"
          width={180}
          height={60}
          priority
          className={styles.logo}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.h1}>RSVP</h1>
          <p className={styles.sub}>
            Conferma la tua partecipazione. Niente spam, solo logistica.
          </p>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            {/* honeypot anti-bot (invisibile) */}
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className={styles.honeypot}
            />

            <label className={styles.label}>
              <span className={styles.labelText}>Nome e Cognome</span>
              <input
                className={`${styles.input} ${nameError ? styles.inputInvalid : ""}`}
                name="name"
                required
                placeholder="Nome e cognome"
                autoComplete="name"
                onChange={() => {
                  if (nameError) setNameError(null);
                  if (error) setError(null);
                }}
              />
              {nameError && <div className={styles.fieldError}>{nameError}</div>}
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Email</span>
              <input
                className={`${styles.input} ${emailError ? styles.inputInvalid : ""}`}
                name="email"
                required
                type="email"
                placeholder="nome@email.com"
                autoComplete="email"
                onChange={() => {
                  if (emailError) setEmailError(null);
                  if (error) setError(null);
                }}
              />
              {emailError && <div className={styles.fieldError}>{emailError}</div>}
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Parteciperai?</span>
              <select className={styles.select} name="status" defaultValue="si">
                <option value="si">Sì</option>
                <option value="forse">Forse</option>
                <option value="no">No</option>
              </select>
            </label>

            {error && <div className={styles.error}>{error}</div>}

            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? "Invio..." : "Partecipa"}
            </button>

            <p className={styles.privacy}>
              Inviando accetti che useremo i dati solo per la gestione dell’evento. Per richiedere la cancellazione dei dati scrivi a: simbiosievents@gmail.com
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}