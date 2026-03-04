"use client";

import Image from "next/image";
import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./join.module.css";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getLeft(targetMs: number) {
  const diff = targetMs - Date.now();
  if (diff <= 0) return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const s = Math.floor(diff / 1000);
  return {
    done: false,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export default function JoinPage() {
  const sp = useSearchParams();
  const ticket = (sp.get("t") || "").trim();

  // 🔧 DATA/ORA EVENTO (Italia)
  const eventTime = useMemo(() => new Date("2026-03-27T23:30:00+01:00").getTime(), []);
  const [left, setLeft] = useState(() => getLeft(eventTime));

  useEffect(() => {
    const id = setInterval(() => setLeft(getLeft(eventTime)), 1000);
    return () => clearInterval(id);
  }, [eventTime]);

  // QR offline: contiene solo il ticket -> perfetto per match su CSV
  const qrPayload = ticket ? `TICKET:${ticket}` : "TICKET:MISSING";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrPayload)}`;

  return (
    <main className={styles.main}>
      <div className={styles.shell}>

        {/* DESTRA */}
        <section className={styles.right}>
          <div className={styles.brand}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={240}
              height={80}
              className={styles.logo}
              priority
            />
          </div>

          <h1 className={styles.title}>TRASMISSIONE RICEVUTA</h1>
          <p className={styles.subtitle}>Sei dentro. Ti abbiamo aggiunto alla lista.</p>
          <div className={styles.posterWrap}>
            <Image
              src="/cover-planet.jpg"
              alt="Locandina evento"
              fill
              priority
              className={styles.poster}
            />
          </div>

          
          {/* COUNTDOWN */}
          <div className={styles.countdownCard}>
            <div className={styles.sectionLabel}>COUNTDOWN</div>
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
          </div>
        {/* QR INGRESSO */}
          <div className={styles.qrCard}>
            <div className={styles.sectionLabel}>QR INGRESSO</div>

            <div className={styles.qrGrid}>
              <div className={styles.qrBox}>
                <img className={styles.qrImg} src={qrUrl} alt="QR ingresso" />
              </div>

              <div className={styles.qrMeta}>
                <div className={styles.ticketRow}>
                  <span className={styles.k}>Ticket</span>
                  <span className={styles.ticket}>{ticket || "—"}</span>
                </div>
                <p className={styles.qrHint}>
                  Fai uno screenshot e mostralo all’ingresso.
                </p>
              </div>
            </div>
          </div>
          {/* INFO EVENTO */}
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.k}>Ticket</span>
              <span className={styles.v}>€10 all’ingresso</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.k}>Data</span>
              <span className={styles.v}>Venerdì 27 marzo</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.k}>Orario</span>
              <span className={styles.v}>Start 23:30</span>
            </div>

            <div className={styles.lineup}>
              <div className={styles.k}>Line up</div>
              <ul className={styles.list}>
                <li><span className={styles.live}>LIVE</span> Wena</li>
                <li><span className={styles.live}>LIVE</span> User_D</li>
                <li><span className={styles.live}>LIVE</span> Alien 23</li>
                <li><span className={styles.live}>LIVE</span> Steffy Tek</li>
                <li><span className={styles.live}>DJSET</span>Trisha</li>
                <li><span className={styles.live}>DJSET</span>Tonachino</li>
                <li><span className={styles.live}>DJSET</span>Nikita</li>
                <li><span className={styles.live}>DJSET</span>Mauvais Garçons </li>
                <li><span className={styles.live}>DJSET</span>Synapses vs Dj Zarra <span className={styles.muted}></span></li>
              </ul>
            </div>
          </div>
          <div className={styles.radarCard}>
            <div className={styles.radarHeader}>
              <div className={styles.place}>PLANET</div>
              <a
                className={styles.mapBtn}
                href="https://www.google.com/maps/search/?api=1&query=Planet%20Lamezia%20Terme"
                target="_blank"
                rel="noreferrer"
              >
                Apri mappa
              </a>
            </div>

            <div className={styles.radar}>
              <div className={styles.radarSweep} />
              <div className={styles.radarGrid} />
              <div className={styles.radarDotWrap}>
                <div className={styles.radarDot} />
                <div className={styles.radarLabel}>PLANET</div>
              </div>
              <div className={styles.radarDot2} />
            </div>
          </div>

          {/* PLAYLIST + BACK */}
          <div className={styles.actions}>
            <a className={styles.btn} href="https://soundcloud.com" target="_blank" rel="noreferrer">
              Playlist
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}