"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType, NotFoundException } from "@zxing/library";

type Props = {
  onResult?: (text: string) => void;
};

type ZXingControls = { stop: () => void } | null;

export default function Scanner({ onResult }: Props) {
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

      // Non usiamo metodi “dubbi” di zxing: prendiamo i device dal browser direttamente.
      const all = await navigator.mediaDevices.enumerateDevices();
      const list = all.filter((d) => d.kind === "videoinput") as MediaDeviceInfo[];
      setDevices(list);

      const preferred =
        list.find((d) => /back|rear|environment/i.test(d.label))?.deviceId ||
        list[0]?.deviceId ||
        "";
      setDeviceId((prev) => prev || preferred);
    } catch (e: any) {
      setError(
        e?.message ||
          "Permesso camera negato o camera non disponibile (controlla HTTPS e permessi)."
      );
    }
  }

  async function start() {
    setError("");
    if (!videoRef.current) return;
    if (!deviceId) {
      setError("Nessuna camera selezionata.");
      return;
    }

    // stop eventuale sessione precedente
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

  function stop() {
    try {
      controlsRef.current?.stop();
    } catch {}
    controlsRef.current = null;
    setRunning(false);
  }

  useEffect(() => {
    refreshDevices();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={refreshDevices} type="button">
          Rileva camere
        </button>

        <select
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          disabled={running}
          style={{ minWidth: 240 }}
        >
          {devices.length === 0 ? (
            <option value="">Nessuna camera</option>
          ) : (
            devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${d.deviceId.slice(0, 6)}…`}
              </option>
            ))
          )}
        </select>

        {!running ? (
          <button onClick={start} type="button" disabled={!deviceId}>
            Avvia scan
          </button>
        ) : (
          <button onClick={stop} type="button">
            Stop
          </button>
        )}
      </div>

      {error ? (
        <div style={{ padding: 10, border: "1px solid #ff6b6b", borderRadius: 12 }}>
          <b style={{ color: "crimson" }}>Errore:</b> {error}
        </div>
      ) : null}

      <div
        style={{
          overflow: "hidden",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,.15)",
          background: "rgba(255,255,255,.03)",
        }}
      >
        <video
          ref={videoRef}
          style={{ width: "100%", height: "auto", display: "block" }}
          muted
          playsInline
        />
      </div>

      <div style={{ padding: 10, border: "1px solid rgba(255,255,255,.15)", borderRadius: 12 }}>
        <b>Ultimo QR:</b>
        <div style={{ wordBreak: "break-all", marginTop: 6 }}>
          {lastText ? lastText : <span style={{ opacity: 0.7 }}>Nessuno</span>}
        </div>
      </div>
    </div>
  );
}