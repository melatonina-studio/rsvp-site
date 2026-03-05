"use client";

import { useRef, useState } from "react";
import Scanner from "./Scanner";

type Result =
  | { status: "idle" }
  | { status: "ok"; name: string; email: string }
  | { status: "already"; name: string; email: string; checkedInAt?: string }
  | { status: "not_found"; code: string }
  | { status: "error"; message: string };

export default function ScanClient() {
  const [res, setRes] = useState<Result>({ status: "idle" });
  const busyRef = useRef(false);
  const lastCodeRef = useRef<string>("");

  async function checkin(code: string) {
    // evita doppie chiamate ravvicinate
    if (busyRef.current && lastCodeRef.current === code) return;
    busyRef.current = true;
    lastCodeRef.current = code;

    try {
      const r = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await r.json();

      if (data.status === "ok") {
        setRes({ status: "ok", name: data.name || "", email: data.email || "" });
        navigator.vibrate?.(80);
      } else if (data.status === "already") {
        setRes({
          status: "already",
          name: data.name || "",
          email: data.email || "",
          checkedInAt: data.checkedInAt,
        });
        navigator.vibrate?.([40, 40, 40]);
      } else if (data.status === "not_found") {
        setRes({ status: "not_found", code });
        navigator.vibrate?.(200);
      } else {
        setRes({ status: "error", message: data.error || "Errore" });
      }
    } catch (e: any) {
      setRes({ status: "error", message: e?.message || "Errore rete" });
    } finally {
      // piccolo cooldown
      setTimeout(() => {
        busyRef.current = false;
      }, 400);
    }
  }

  const banner = (() => {
    const base: any = {
      padding: 14,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,.15)",
      marginBottom: 12,
    };

    if (res.status === "idle") return null;

    if (res.status === "ok") {
      return (
        <div style={base}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>✅ ENTRATO</div>
          <div style={{ marginTop: 6, fontSize: 18 }}>{res.name || "(senza nome)"}</div>
          <div style={{ opacity: 0.8 }}>{res.email}</div>
        </div>
      );
    }

    if (res.status === "already") {
      return (
        <div style={base}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>🟡 GIÀ ENTRATO</div>
          <div style={{ marginTop: 6, fontSize: 18 }}>{res.name || "(senza nome)"}</div>
          <div style={{ opacity: 0.8 }}>{res.email}</div>
          {res.checkedInAt ? (
            <div style={{ opacity: 0.7, marginTop: 6 }}>checkedInAt: {res.checkedInAt}</div>
          ) : null}
        </div>
      );
    }

    if (res.status === "not_found") {
      return (
        <div style={base}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>🔴 NON TROVATO</div>
          <div style={{ marginTop: 6, wordBreak: "break-all" }}>{res.code}</div>
        </div>
      );
    }

    return (
      <div style={base}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>⚠️ ERRORE</div>
        <div style={{ marginTop: 6 }}>{res.message}</div>
      </div>
    );
  })();

  return (
    <div>
      {banner}

      <Scanner
        onResult={(text) => {
          const code = (text || "").trim();
          if (!code) return;
          checkin(code);
        }}
      />
    </div>
  );
}