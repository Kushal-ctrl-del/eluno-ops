"use client";
import { useMemo, useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import { generateMockOrders, generateMockAlerts } from "@/lib/mock-data";
import { AlertTriangle, Zap, CheckCircle, Clock, MapPin, ChevronRight, Bell } from "lucide-react";
import { formatTimeAgo, getSeverityColor } from "@/lib/utils";
import Link from "next/link";

export default function AlertsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const orders = useMemo(() => generateMockOrders(40), []);
  const alerts = useMemo(() => generateMockAlerts(orders), [orders]);
  const [filter, setFilter] = useState<"all"|"unread"|"critical"|"high">("all");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set(alerts.filter((a) => a.acknowledged).map((a) => a.id)));

  const filtered = alerts.filter((a) => {
    if (filter === "unread") return !acknowledged.has(a.id);
    if (filter === "critical") return a.severity === "critical";
    if (filter === "high") return a.severity === "high";
    return true;
  });

  if (!mounted) return null;

  const unreadCount = alerts.filter((a) => !acknowledged.has(a.id)).length;
  const criticalCount = alerts.filter((a) => a.severity === "critical" && !acknowledged.has(a.id)).length;

  return (
    <AppLayout title="Breach Alerts" subtitle={`${unreadCount} unacknowledged · AI-powered predictions`} alertCount={criticalCount}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[
            { label: "Total Alerts", value: alerts.length, color: "#818CF8", bg: "rgba(129,140,248,0.1)", icon: Bell },
            { label: "Critical", value: alerts.filter((a) => a.severity === "critical").length, color: "#F43F5E", bg: "rgba(244,63,94,0.1)", icon: AlertTriangle },
            { label: "High Risk", value: alerts.filter((a) => a.severity === "high").length, color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: AlertTriangle },
            { label: "Acknowledged", value: acknowledged.size, color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle },
          ].map((s) => (
            <div key={s.label} style={{ background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35", padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <s.icon size={16} color={s.color} />
              </div>
              <div>
                <p style={{ fontFamily: "Sora,sans-serif", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 10, color: "#475569" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: 16, background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {(["all","unread","critical","high"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${filter === f ? "rgba(129,140,248,0.3)" : "transparent"}`, background: filter === f ? "rgba(129,140,248,0.1)" : "transparent", color: filter === f ? "#818CF8" : "#475569", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>
                {f}{f === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            ))}
          </div>
          <button onClick={() => setAcknowledged(new Set(alerts.map((a) => a.id)))}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "#10B981", border: "1px solid rgba(16,185,129,0.2)", padding: "6px 14px", borderRadius: 8, background: "transparent", cursor: "pointer" }}>
            <CheckCircle size={12} /> Acknowledge All
          </button>
        </div>

        {/* Alert cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 && (
            <div style={{ padding: 64, textAlign: "center", background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35" }}>
              <CheckCircle size={32} color="#10B981" style={{ margin: "0 auto 12px", opacity: 0.5 }} />
              <p style={{ color: "#475569", fontSize: 13 }}>No alerts in this category</p>
            </div>
          )}
          {filtered.map((alert) => {
            const isAcked = acknowledged.has(alert.id);
            const color = getSeverityColor(alert.severity);
            const isCritical = alert.severity === "critical";
            return (
              <div key={alert.id} className={isCritical && !isAcked ? "breach-pulse" : ""}
                style={{ position: "relative", background: "#0F0F1A", borderRadius: 12, border: `1px solid ${isCritical && !isAcked ? "rgba(244,63,94,0.3)" : "#1E1E35"}`, padding: 20, opacity: isAcked ? 0.5 : 1, transition: "opacity 0.3s" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, borderRadius: "12px 0 0 12px", background: color }} />
                <div style={{ paddingLeft: 12, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 4, color, background: `${color}18` }}>{alert.severity}</span>
                      <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#F1F5F9" }}>{alert.order_number}</span>
                      <StatusBadge status={alert.current_status} size="sm" />
                      {!isAcked && isCritical && <span style={{ fontSize: 10, color: "#F43F5E", fontWeight: 600, animation: "pulse 2s infinite" }}>● LIVE</span>}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#F1F5F9", marginBottom: 4 }}>{alert.customer_name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
                      <MapPin size={11} color="#475569" />
                      <span style={{ fontSize: 11, color: "#475569" }}>{alert.store_location}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 12, background: "#14142A", borderRadius: 8, border: "1px solid #1E1E35", marginBottom: 10 }}>
                      <Zap size={12} color="#818CF8" style={{ marginTop: 1, flexShrink: 0 }} />
                      <p style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.5 }}>{alert.ai_reason}</p>
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, color: "#475569" }}>Breach probability: <span style={{ color, fontWeight: 700 }}>{Math.round(alert.breach_probability * 100)}%</span></span>
                      <span style={{ fontSize: 10, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={10} /> {alert.hours_remaining < 0 ? `${Math.abs(alert.hours_remaining).toFixed(1)}h overdue` : `${alert.hours_remaining.toFixed(1)}h remaining`}
                      </span>
                      <span style={{ fontSize: 10, color: "#475569" }}>Flagged {formatTimeAgo(alert.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                    {!isAcked ? (
                      <button onClick={() => setAcknowledged((prev) => new Set([...prev, alert.id]))}
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "#10B981", border: "1px solid rgba(16,185,129,0.2)", padding: "6px 12px", borderRadius: 8, background: "transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
                        <CheckCircle size={11} /> Acknowledge
                      </button>
                    ) : (
                      <span style={{ fontSize: 10, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={10} /> Acknowledged</span>
                    )}
                    <Link href={`/orders/${alert.order_id}`}>
                      <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: "#818CF8", background: "transparent", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                        View Order <ChevronRight size={11} />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}