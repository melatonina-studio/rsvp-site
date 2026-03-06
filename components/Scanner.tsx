"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType, NotFoundException } from "@zxing/library";

type Props = {
  onResult?: (text: string) => void;
  feedback?: {
    type: "idle" | "ok" | "already" | "not_found" | "error";
    title?: string;
    subtitle?: string;
  };
};

type ZXingControls = { stop: () => void } | null;

export default function Scanner({ onResult, feedback }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<ZXingControls>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string>("");
  const [lastText, setLastText] = useState<string>("");
  const [lastAt, setLastAt] = useState<number>(0);

  const hints = useMemo(() => {
    const h = new Map<DecodeHintType, any>();
    h.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    return h;
  }, []);

  const reader = useMemo(() => new BrowserMultiFormatReader(hints), [hints]);

  async function refreshDevices() {
    setError("");
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });

      const all = await navigator.mediaDevices.enumerateDevices();
      const list = all.filter((d) => d.kind === "videoinput") as MediaDeviceInfo[];
      setDevices(list);

      const preferred =
        list.find((d) => /back|rear|environment|posteriore/i.test(d.label))?.deviceId ||
        list[list.length - 1]?.deviceId ||
        list[0]?.deviceId ||
        "";

      setDeviceId((prev) => prev || preferred);
    } catch (e: any) {
      setError(e?.message || "Permesso fotocamera negato o fotocamera non disponibile.");
    }
  }

  function stop() {
    try {
      controlsRef.current?.stop();
    } catch {}
    controlsRef.current = null;
    setRunning(false);
  }

  async function start() {
    setError("");
    if (!videoRef.current) return;

    if (!deviceId) {
      setError("Nessuna fotocamera selezionata.");
      return;
    }

    stop();
    setRunning(true);

    try {
      const controls = await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (res, err) => {
          if (res) {
            const text = (res.getText() || "").trim();
            const now = Date.now();

            const same = text && text === lastText;
            const tooSoon = now - lastAt < 1200;

            if (!text) return;
            if (same && tooSoon) return;

            setLastText(text);
            setLastAt(now);

            // BLOCCA subito lo scanner dopo una lettura valida
            stop();

            onResult?.(text);
            return;
          }

          if (err && err instanceof NotFoundException) return;
        }
      );

      controlsRef.current = controls as unknown as ZXingControls;
    } catch (e: any) {
      setError(e?.message || "Errore avvio scanner.");
      setRunning(false);
    }
  }

  useEffect(() => {
    refreshDevices();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feedbackColors = {
    idle: "rgba(20,20,20,.72)",
    ok: "rgba(0,160,80,.92)",
    already: "rgba(208,158,0,.94)",
    not_found: "rgba(210,35,35,.94)",
    error: "rgba(180,40,40,.94)",
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,.14)",
        background: "#0f1115",
        boxShadow: "0 8px 30px rgba(0,0,0,.35)",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "9 / 14",
          background: "#000",
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          muted
          playsInline
        />

        {!running && feedback?.type === "idle" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,.45)",
              padding: 20,
            }}
          >
            <button
              onClick={start}
              type="button"
              disabled={!deviceId}
              style={{
                width: "100%",
                maxWidth: 280,
                padding: "16px 20px",
                borderRadius: 18,
                border: "none",
                background: "#ffffff",
                color: "#000",
                fontWeight: 800,
                fontSize: 18,
                cursor: !deviceId ? "not-allowed" : "pointer",
                opacity: !deviceId ? 0.6 : 1,
                boxShadow: "0 10px 30px rgba(0,0,0,.35)",
              }}
            >
              Avvia scanner
            </button>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: running ? "rgba(0,180,90,.9)" : "rgba(20,20,20,.7)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              backdropFilter: "blur(8px)",
            }}
          >
            {running ? "Scanner attivo" : "Scanner fermo"}
          </div>

          {running ? (
            <button
              onClick={stop}
              type="button"
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "none",
                background: "rgba(220,40,40,.92)",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Stop
            </button>
          ) : (
            <button
              onClick={start}
              type="button"
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "none",
                background: "rgba(0,120,255,.92)",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Nuova scansione
            </button>
          )}
        </div>

        {feedback && feedback.type !== "idle" && (
          <div
            style={{
              position: "absolute",
              top: 72,
              left: 16,
              right: 16,
              borderRadius: 18,
              padding: "16px 18px",
              background: feedbackColors[feedback.type],
              color: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,.35)",
              zIndex: 3,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>
              {feedback.title}
            </div>
            {feedback.subtitle ? (
              <div style={{ marginTop: 8, fontSize: 17, lineHeight: 1.25 }}>
                {feedback.subtitle}
              </div>
            ) : null}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            top: "56%",
            transform: "translateY(-50%)",
            border: "3px solid rgba(255,255,255,.9)",
            borderRadius: 22,
            height: "34%",
            boxShadow: "0 0 0 9999px rgba(0,0,0,.22)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            display: "grid",
            gap: 10,
          }}
        >
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            disabled={running}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,.18)",
              background: "rgba(15,17,21,.82)",
              color: "#fff",
              fontSize: 15,
              backdropFilter: "blur(10px)",
            }}
          >
            {devices.length === 0 ? (
              <option value="">Nessuna fotocamera</option>
            ) : (
              devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${d.deviceId.slice(0, 6)}…`}
                </option>
              ))
            )}
          </select>

          <button
            onClick={refreshDevices}
            type="button"
            disabled={running}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,.14)",
              background: "rgba(255,255,255,.08)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: running ? "not-allowed" : "pointer",
              opacity: running ? 0.6 : 1,
            }}
          >
            Aggiorna fotocamere
          </button>
        </div>
      </div>

      {error ? (
        <div
          style={{
            padding: 14,
            borderTop: "1px solid rgba(255,255,255,.1)",
            background: "rgba(180,20,20,.12)",
            color: "#fff",
          }}
        >
          <b>Errore:</b> {error}
        </div>
      ) : null}

      <div
        style={{
          padding: 14,
          borderTop: "1px solid rgba(255,255,255,.08)",
          background: "#11131a",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
          Ultimo QR letto
        </div>
        <div style={{ wordBreak: "break-all", fontSize: 14 }}>
          {lastText || "Nessuno"}
        </div>
      </div>
    </div>
  );
}