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
        setRes({
          status: "ok",
          name: data.name || "",
          email: data.email || "",
        });
        navigator.vibrate?.(100);
      } else if (data.status === "already") {
        setRes({
          status: "already",
          name: data.name || "",
          email: data.email || "",
          checkedInAt: data.checkedInAt,
        });
        navigator.vibrate?.([60, 40, 60]);
      } else if (data.status === "not_found") {
        setRes({ status: "not_found", code });
        navigator.vibrate?.(180);
      } else {
        setRes({ status: "error", message: data.error || "Errore" });
      }
    } catch (e: any) {
      setRes({ status: "error", message: e?.message || "Errore rete" });
    } finally {
      setTimeout(() => {
        busyRef.current = false;
      }, 500);
    }
  }

  const feedback =
  res.status === "ok"
    ? {
        type: "ok" as const,
        title: "✅ VALIDO",
        subtitle: res.name || res.email || "Ingresso confermato",
      }
    : res.status === "already"
    ? {
        type: "already" as const,
        title: "🟡 GIÀ ENTRATO",
        subtitle: res.name || res.email || "Questo QR risulta già usato",
      }
    : res.status === "not_found"
    ? {
        type: "not_found" as const,
        title: "🔴 NON TROVATO",
        subtitle: res.code,
      }
    : res.status === "error"
    ? {
        type: "error" as const,
        title: "⚠️ ERRORE",
        subtitle: res.message,
      }
    : {
        type: "idle" as const,
        title: "",
        subtitle: "",
      };

  return (
    <div>
      <Scanner
        feedback={feedback}
        onResult={(text) => {
          const code = (text || "").trim();
          if (!code) return;
          checkin(code);
        }}
      />
    </div>
  );
}