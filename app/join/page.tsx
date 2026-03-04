"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "./join.module.css";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type Left = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function getLeft(targetMs: number): Left {
  const now = Date.now();
  const diff = targetMs - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };

  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  return { days, hours, minutes, seconds, done: false };
}

export default function JoinPage() {
  // 🔧 IMPOSTA QUI LA DATA/ORA EVENTO (orario Italia)
  // Esempio: 23 Marzo 2026 ore 23:30
  const eventTime = useMemo(() => new Date("2026-03-23T23:30:00+01:00").getTime(), []);

  const [left, setLeft] = useState<Left>(() => getLeft(eventTime));
  const [phase, setPhase] = useState<"incoming" | "confirmed">("incoming");

  useEffect(() => {
    const t = setInterval(() => setLeft(getLeft(eventTime)), 1000);
    return () => clearInterval(t);
  }, [eventTime]);

  useEffect(() => {
    const a = setTimeout(() => setPhase("confirmed"), 700);
    return () => clearTimeout(a);
  }, []);

  return (
    <main className={styles.main}>
      <video className={styles.video} autoPlay muted loop playsInline>
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      <div className={styles.vignette} />

      <div className={styles.content}>
        <div className={styles.logoBlock}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={220}
            height={70}
            priority
            className={styles.logo}
          />
        </div>

  <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.badge}>RSVP OK</div>
            <div className={styles.glitchWrap}>
              <div className={styles.glitch} data-text="TRASMISSIONE 0K">
                TRASMISSIONE RICEVUTA
              </div>
            </div>
            <p className={styles.sub}>
              {phase === "incoming"
                ? "Incoming signal… decoding…"
                : "Sei dentro. Ti abbiamo aggiunto alla lista."}
            </p>
          </div>

          <div className={styles.grid}>
            <section className={styles.panel}>
              <h2 className={styles.h2}>Radar Place</h2>

              <div className={styles.radar}>
                <div className={styles.radarSweep} />
                <div className={styles.radarGrid} />

                <div className={styles.radarDotWrap}>
                  <div className={styles.radarDot} />
                  <div className={styles.radarLabel}>PLANET</div>
                </div>

                <div className={styles.radarDot2} />
              </div>

              <div className={styles.meta}>
                <div className={styles.metaRow}>
                  <span className={styles.k}>Status</span>
                  <span className={styles.v}>{left.done ? "OPEN" : "LOCKED"}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.k}>TICKET ALLA PORTA</span>
                  <span className={styles.v}>10€</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.k}> La mancata registrazione al sito comporterà il pagamento del ticket a prezzo pieno l'entrata.</span>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.h2}>Countdown</h2>
              <div className={styles.countdown}>
                <div className={styles.timeBox}>
                  <div className={styles.timeNum}>{left.days}</div>
                  <div className={styles.timeLbl}>giorni</div>
                </div>
                <div className={styles.timeBox}>
                  <div className={styles.timeNum}>{pad(left.hours)}</div>
                  <div className={styles.timeLbl}>ore</div>
                </div>
                <div className={styles.timeBox}>
                  <div className={styles.timeNum}>{pad(left.minutes)}</div>
                  <div className={styles.timeLbl}>min</div>
                </div>
                <div className={styles.timeBox}>
                  <div className={styles.timeNum}>{pad(left.seconds)}</div>
                  <div className={styles.timeLbl}>sec</div>
                </div>
              </div>
              <div className={styles.info}>
                <div className={styles.infoRow}>
                  <span className={styles.k}>Data</span>
                  <span className={styles.v}>Venerdì 27 marzo</span>
                </div>

                <div className={styles.infoBlock}>
                  <div className={styles.k}>Line up</div>
                  <ul className={styles.list}>
                    <li><span className={styles.live}>LIVE</span> Wena</li>
                    <li><span className={styles.live}>LIVE</span> User_D</li>
                    <li><span className={styles.live}>LIVE</span> Alien 23</li>
                    <li><span className={styles.live}>LIVE</span> Steffy Tek</li>
                    <li><span className={styles.live}>DJSET</span>Trisha</li>
                    <li><span className={styles.live}>DJSET</span>Tonachino</li>
                    <li><span className={styles.live}>DJSET</span>Nikita</li>
                    <li><span className={styles.live}>DJSET</span>Mauvais Garçons</li>
                     <li><span className={styles.live}>DJSET</span>Synapsess vs Dj Zarra</li>
                  </ul>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.k}>Location</span>
                  <span className={styles.v}>
                    Planet — Lamezia Terme{" "}
                    <a
                      className={styles.mapLink}
                      href="https://maps.app.goo.gl/YvaPj4BKUz2kLkfV7"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Apri su Maps
                    </a>
                  </span>
                </div>
              </div>
            </section>

            
          </div>

          <div className={styles.actions}>
            {/* Cambia questi link quando vuoi */}
            <a className={styles.btn} href="https://soundcloud.com" target="_blank" rel="noreferrer">
              Unlock soundtrack
            </a>
            <a className={styles.btnGhost} href="/" title="Torna al form">
              Torna indietro
            </a>
          </div>

          <p className={styles.footer}>
            Non condividere questa pagina. Se ti serve assistenza: simbiosievents@gmail.com
          </p>
        </div>
      </div>
    </main>
  );
}