"use client";
import { Bell, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header({ title, subtitle, alertCount = 0 }: { title: string; subtitle?: string; alertCount?: number }) {
  const [time, setTime] = useState(new Date());
  const [spin, setSpin] = useState(false);
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, height: 60, borderBottom: "1px solid #1E1E35", background: "rgba(8,8,14,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
      <div>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 15, fontWeight: 600, color: "#F1F5F9" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", background: "#0F0F1A", border: "1px solid #1E1E35", padding: "6px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span className="status-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
          {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
        <button onClick={() => { setSpin(true); setTimeout(() => setSpin(false), 1000); }}
          style={{ width: 32, height: 32, borderRadius: 8, background: "#0F0F1A", border: "1px solid #1E1E35", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <RefreshCw size={13} color="#475569" style={{ animation: spin ? "spin 1s linear" : "none" }} />
        </button>
        <Link href="/alerts">
          <button style={{ width: 32, height: 32, borderRadius: 8, background: "#0F0F1A", border: "1px solid #1E1E35", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
            <Bell size={13} color="#475569" />
            {alertCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#F43F5E", color: "white", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{alertCount > 9 ? "9+" : alertCount}</span>}
          </button>
        </Link>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#818CF8,#22D3EE)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>EO</div>
      </div>
    </header>
  );
}