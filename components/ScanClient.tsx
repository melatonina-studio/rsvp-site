"use client";

import { useEffect, useRef, useState } from "react";
import Scanner from "./Scanner";

type Result =
  | { status: "idle" }
  | { status: "ok"; name: string; email: string }
  | { status: "already"; name: string; email: string; checkedInAt?: string }
  | { status: "not_found"; code: string }
  | { status: "error"; message: string };

type CheckedInEntry = {
  name: string;
  email: string;
  checkedInAt: string;
};

export default function ScanClient() {
  const [res, setRes] = useState<Result>({ status: "idle" });
  const busyRef = useRef(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [count, setCount] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const [entries, setEntries] = useState<CheckedInEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  function resetToIdle() {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      setRes({ status: "idle" });
      busyRef.current = false;
    }, 2200);
  }

  async function loadCheckedIn() {
    setLoadingEntries(true);
    try {
      const res = await fetch("/api/checked-in", { cache: "no-store" });
      const data = await res.json();
      setCount(data.count || 0);
      setEntries(data.entries || []);
    } catch {
      setEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  }

  useEffect(() => {
    loadCheckedIn();
  }, []);

  async function checkin(code: string) {
    if (busyRef.current) return;
    busyRef.current = true;

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
        loadCheckedIn();
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
        navigator.vibrate?.(180);
      }

      resetToIdle();
    } catch (e: any) {
      setRes({ status: "error", message: e?.message || "Errore rete" });
      navigator.vibrate?.(180);
      resetToIdle();
    }
  }

  const feedback =
    res.status === "ok"
      ? {
          type: "ok" as const,
          title: "VALIDO",
          subtitle: res.name || res.email || "Ingresso confermato",
        }
      : res.status === "already"
      ? {
          type: "already" as const,
          title: "GIÀ ENTRATO",
          subtitle: res.name || res.email || "QR già usato",
        }
      : res.status === "not_found"
      ? {
          type: "not_found" as const,
          title: "NON TROVATO",
          subtitle: res.code,
        }
      : res.status === "error"
      ? {
          type: "error" as const,
          title: "ERRORE",
          subtitle: res.message,
        }
      : {
          type: "idle" as const,
          title: "",
          subtitle: "",
        };

  return (
    <>
      <Scanner
        feedback={feedback}
        onResult={(text) => {
          const code = (text || "").trim();
          if (!code) return;
          checkin(code);
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 12,
          alignItems: "center",
          marginTop: 14,
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 16,
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>Entrate registrate</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 2 }}>{count}</div>
        </div>

        <button
          type="button"
          onClick={() => {
            setListOpen(true);
            loadCheckedIn();
          }}
          style={{
            padding: "14px 18px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.14)",
            background: "rgba(255,255,255,.08)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            minHeight: 72,
          }}
        >
          Entrati
        </button>
      </div>

      {listOpen && (
        <div
          onClick={() => setListOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 760,
              maxHeight: "80vh",
              overflow: "hidden",
              borderRadius: 20,
              background: "#11131a",
              border: "1px solid rgba(255,255,255,.1)",
              boxShadow: "0 20px 60px rgba(0,0,0,.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                borderBottom: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Entrati</div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>{count} persone</div>
              </div>

              <button
                type="button"
                onClick={() => setListOpen(false)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.14)",
                  background: "rgba(255,255,255,.08)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Chiudi
              </button>
            </div>

            <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
              {loadingEntries ? (
                <div style={{ padding: 16 }}>Caricamento...</div>
              ) : entries.length === 0 ? (
                <div style={{ padding: 16, opacity: 0.75 }}>Nessuna entrata registrata.</div>
              ) : (
                entries.map((entry, index) => (
                  <div
                    key={`${entry.email}-${entry.checkedInAt}-${index}`}
                    style={{
                      padding: 16,
                      borderBottom: "1px solid rgba(255,255,255,.06)",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {entry.name || "Senza nome"}
                    </div>
                    <div style={{ opacity: 0.78, marginTop: 4 }}>{entry.email}</div>
                    <div style={{ opacity: 0.55, marginTop: 6, fontSize: 12 }}>
                      {entry.checkedInAt}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}