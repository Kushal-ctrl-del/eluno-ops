"use client";
import { useMemo, useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import SLARing from "@/components/ui/SLARing";
import { Activity, AlertTriangle, CheckCircle, Clock, Package, TrendingUp, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { LENS_TYPE_LABELS } from "@/types";
import { formatTimeAgo, formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchData = async () => {
      try {
        const [ordersRes, alertsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/alerts"),
        ]);
        const ordersData = await ordersRes.json();
        const alertsData = await alertsRes.json();
        setOrders(ordersData.data || []);
        setAlerts(alertsData.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  const criticalAlerts = useMemo(() => 
    alerts.filter((a) => !a.acknowledged && (a.severity === "critical" || a.severity === "high")), 
    [alerts]
  );

  const recentOrders = orders.slice(0, 8);

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== "delivered");
    const breached = active.filter((o) => (o.breach_probability ?? 0) > 0.85);
    const atRisk = active.filter((o) => (o.breach_probability ?? 0) > 0.4 && (o.breach_probability ?? 0) <= 0.85);
    const onTrack = active.filter((o) => (o.breach_probability ?? 0) <= 0.4);
    
    return {
      total_active: active.length,
      on_track: onTrack.length,
      at_risk: atRisk.length,
      breached: breached.length,
      delivered_today: orders.filter((o) => o.status === "delivered").length,
      avg_tat_hours: orders.length > 0 ? (orders.reduce((a: number, o: any) => a + (o.sla_hours || 24), 0) / orders.length).toFixed(1) : 0,
      in_house_rate: orders.length > 0 ? ((orders.filter((o) => o.is_in_house).length / orders.length) * 100).toFixed(1) : 0,
      qc_pass_rate: orders.length > 0 ? ((orders.filter((o) => o.status !== "qc_failed").length / orders.length) * 100).toFixed(1) : 0,
    };
  }, [orders]);

  const lensBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.lens_type] = (counts[o.lens_type] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({
      type,
      count,
      label: LENS_TYPE_LABELS[type as keyof typeof LENS_TYPE_LABELS],
      pct: Math.round((count / orders.length) * 100),
    }));
  }, [orders]);

  if (!mounted || loading) return <div style={{ padding: 32, color: "#475569" }}>Loading...</div>;

  return (
    <AppLayout title="Operations Dashboard" subtitle={`${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · ${orders.length} orders tracked`} alertCount={criticalAlerts.length}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {criticalAlerts.length > 0 && (
          <div className="breach-pulse" style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 12, background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.2)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(244,63,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={16} color="#F43F5E" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#F43F5E" }}>{criticalAlerts.length} Critical SLA Breach{criticalAlerts.length > 1 ? "es" : ""} Detected</p>
              <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>AI has flagged these orders — immediate action required</p>
            </div>
            <Link href="/alerts">
              <button style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#F43F5E", border: "1px solid rgba(244,63,94,0.3)", padding: "6px 12px", borderRadius: 8, background: "transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
                View Alerts <ArrowRight size={12} />
              </button>
            </Link>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard title="Active Orders" value={stats.total_active} icon={Activity} accent="indigo" trend="up" trendValue="+12%" subtitle="vs. last week" />
          <StatCard title="On Track" value={stats.on_track} icon={CheckCircle} accent="success" subtitle="Within SLA window" />
          <StatCard title="At Risk" value={stats.at_risk} icon={Clock} accent="warning" subtitle="Needs monitoring" />
          <StatCard title="SLA Breached" value={stats.breached} icon={AlertTriangle} accent="danger" subtitle="Immediate action" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard title="Delivered Today" value={stats.delivered_today} icon={CheckCircle} accent="cyan" />
          <StatCard title="Avg TAT" value={stats.avg_tat_hours} suffix="h" icon={TrendingUp} accent="indigo" />
          <StatCard title="In-House Rate" value={stats.in_house_rate} suffix="%" icon={Package} accent="success" />
          <StatCard title="QC Pass Rate" value={stats.qc_pass_rate} suffix="%" icon={ShieldCheck} accent="cyan" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
          <div style={{ background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #1E1E35" }}>
              <div>
                <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>Recent Orders</h2>
                <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Live SLA tracking</p>
              </div>
              <Link href="/orders"><button style={{ fontSize: 11, fontWeight: 600, color: "#818CF8", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>View all <ArrowRight size={11} /></button></Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1E1E35" }}>
                    {["Order","Customer","Lens","Status","SLA","Store"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="table-row-hover" style={{ borderBottom: "1px solid rgba(30,30,53,0.5)", cursor: "pointer" }} onClick={() => window.location.href = `/orders/${order.id}`}>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: "#F1F5F9" }}>{order.order_number}</p>
                        <p style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{formatTimeAgo(order.created_at)}</p>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: "#F1F5F9" }}>{order.customer_name}</p>
                        <p style={{ fontSize: 10, color: "#475569", textTransform: "capitalize" }}>{order.source}</p>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 11, color: "#94A3B8" }}>{LENS_TYPE_LABELS[order.lens_type as keyof typeof LENS_TYPE_LABELS]}</p>
                        <p style={{ fontSize: 10, color: "#475569" }}>idx {order.lens_index}</p>
                      </td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={order.status} size="sm" /></td>
                      <td style={{ padding: "12px 16px" }}><SLARing createdAt={order.created_at} slaHours={order.sla_hours} size={44} strokeWidth={3} showLabel={false} /></td>
                      <td style={{ padding: "12px 16px" }}><p style={{ fontSize: 10, color: "#475569", maxWidth: 100 }}>{order.store_location}</p></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35", padding: 20 }}>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 16 }}>Lens Mix</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {lensBreakdown.map((item, i) => (
                  <div key={item.type}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>{item.label}</span>
                      <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: "#F1F5F9" }}>{item.count} ({item.pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: "#14142A", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${item.pct}%`, background: "linear-gradient(90deg,#818CF8,#22D3EE)", borderRadius: 3, opacity: 1 - i * 0.15, transition: "width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg,rgba(129,140,248,0.1),rgba(34,211,238,0.05))", borderRadius: 12, border: "1px solid rgba(129,140,248,0.2)", padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Zap size={14} color="#818CF8" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#818CF8" }}>AI Insight</span>
              </div>
              <p style={{ fontSize: 13, color: "#F1F5F9", lineHeight: 1.6 }}>
                Progressive lens orders averaging <span style={{ color: "#22D3EE" }}>18% longer TAT</span> this week. Coating stage is the primary bottleneck.
              </p>
              <p style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>Recommendation: Pre-route progressive orders to Bangalore hub</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}