"use client";
import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import SLARing from "@/components/ui/SLARing";
import { generateMockOrders } from "@/lib/mock-data";
import { STATUS_LABELS, LENS_TYPE_LABELS, OrderStatus, STATUS_ORDER } from "@/types";
import { formatTimeAgo, formatCurrency, getStatusColor } from "@/lib/utils";
import { User, Phone, MapPin, Glasses, Clock, Zap, Edit3, ArrowLeft } from "lucide-react";
import Link from "next/link";

const ALL_STATUSES: OrderStatus[] = ["order_placed","prescription_verified","lens_cutting","coating","qc_check","qc_failed","assembly","dispatch_ready","dispatched","delivered"];

export default function OrderDetailPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const params = useParams();
  const orders = useMemo(() => generateMockOrders(40), []);
  const idx = parseInt(String(params.id).replace("order_", "")) - 1;
  const order = orders[idx] || orders[0];
  const [newStatus, setNewStatus] = useState<OrderStatus>(order?.status);
  const [updateNote, setUpdateNote] = useState("");
  const [delayReason, setDelayReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!mounted) return null;
  if (!order) return <div style={{ padding: 32, color: "#475569" }}>Order not found</div>;

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);

  const handleUpdate = () => {
    setUpdating(true);
    setTimeout(() => { setUpdating(false); setSuccess(true); setTimeout(() => setSuccess(false), 3000); }, 1200);
  };

  const cardStyle = { background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35", padding: 20 };
  const labelStyle = { fontSize: 10, color: "#475569", marginBottom: 2 };
  const valueStyle = { fontSize: 13, fontWeight: 600, color: "#F1F5F9" };

  return (
    <AppLayout title={order.order_number} subtitle={`${order.customer_name} · ${order.store_location}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Link href="/orders">
          <button style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569", background: "transparent", border: "none", cursor: "pointer" }}>
            <ArrowLeft size={13} /> Back to Orders
          </button>
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Header */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>{order.order_number}</h2>
                    <StatusBadge status={order.status} />
                  </div>
                  <p style={{ fontSize: 12, color: "#475569" }}>Placed {formatTimeAgo(order.created_at)} · <span style={{ textTransform: "capitalize" }}>{order.source}</span></p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 700, color: "#F1F5F9" }}>{formatCurrency(order.price)}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: order.is_in_house ? "#10B981" : "#F59E0B", marginTop: 2 }}>{order.is_in_house ? "✓ Lens In-House" : "⚡ External Sourcing"}</p>
                </div>
              </div>

              {/* Progress */}
              <p style={{ fontSize: 10, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Order Progress · Stage {currentStepIndex + 1} of {STATUS_ORDER.length}</p>
              <div style={{ display: "flex", alignItems: "center" }}>
                {STATUS_ORDER.map((s, i) => {
                  const done = i <= currentStepIndex;
                  const current = i === currentStepIndex;
                  const color = getStatusColor(s);
                  return (
                    <div key={s} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                      {i > 0 && <div style={{ flex: 1, height: 2, background: done ? color : "#1E1E35", transition: "background 0.5s" }} />}
                      <div title={STATUS_LABELS[s]} style={{ width: 12, height: 12, borderRadius: "50%", background: done ? color : "#1E1E35", flexShrink: 0, boxShadow: current ? `0 0 8px ${color}` : "none", border: current ? `2px solid ${color}` : "none", transition: "all 0.3s" }} />
                      {i < STATUS_ORDER.length - 1 && <div style={{ flex: 1, height: 2, background: i < currentStepIndex ? color : "#1E1E35", transition: "background 0.5s" }} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer + Prescription */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={cardStyle}>
                <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <User size={14} color="#818CF8" /> Customer
                </h3>
                {[
                  [<Phone key="p" size={11} color="#475569" />, order.customer_phone],
                  [<MapPin key="m" size={11} color="#475569" />, order.store_location],
                ].map(([icon, val], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    {icon}<span style={{ fontSize: 12, color: "#94A3B8" }}>{val as string}</span>
                  </div>
                ))}
                <p style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 4 }}>{order.customer_name}</p>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Glasses size={14} color="#22D3EE" /> Prescription
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    ["R SPH", order.prescription.right_sph > 0 ? `+${order.prescription.right_sph}` : String(order.prescription.right_sph)],
                    ["R CYL", String(order.prescription.right_cyl)],
                    ["L SPH", order.prescription.left_sph > 0 ? `+${order.prescription.left_sph}` : String(order.prescription.left_sph)],
                    ["L CYL", String(order.prescription.left_cyl)],
                    ["PD", `${order.prescription.pd}mm`],
                    ["AXIS", `${order.prescription.right_axis}°`],
                  ].map(([label, val]) => (
                    <div key={label as string}>
                      <p style={labelStyle}>{label as string}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: "#F1F5F9" }}>{val as string}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E1E35" }}>
                  <p style={labelStyle}>Lens Specs</p>
                  <p style={{ fontSize: 12, color: "#94A3B8" }}>{LENS_TYPE_LABELS[order.lens_type]} · Index {order.lens_index}</p>
                  <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Frame: {order.frame_model} · {order.frame_color}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div style={cardStyle}>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={14} color="#818CF8" /> Order Timeline
              </h3>
              <div style={{ position: "relative", paddingLeft: 20 }}>
                <div style={{ position: "absolute", left: 6, top: 6, bottom: 6, width: 1, background: "#1E1E35" }} />
                {order.status_history.map((event, i) => {
                  const color = getStatusColor(event.status);
                  return (
                    <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, position: "relative" }}>
                      <div style={{ position: "absolute", left: -14, top: 3, width: 14, height: 14, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}60`, zIndex: 1 }} />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9" }}>{STATUS_LABELS[event.status]}</p>
                          <p style={{ fontSize: 10, color: "#475569" }}>{formatTimeAgo(event.timestamp)}</p>
                        </div>
                        <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>by {event.updated_by}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 16, alignSelf: "flex-start" }}>SLA Status</h3>
              <SLARing createdAt={order.created_at} slaHours={order.sla_hours} size={96} strokeWidth={6} showLabel={true} />
              <div style={{ width: "100%", marginTop: 16 }}>
                {[["SLA Window", `${order.sla_hours}h`], ["Lens Type", LENS_TYPE_LABELS[order.lens_type]]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E1E35" }}>
                    <span style={{ fontSize: 12, color: "#475569" }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg,rgba(129,140,248,0.1),rgba(34,211,238,0.05))", borderRadius: 12, border: "1px solid rgba(129,140,248,0.2)", padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Zap size={14} color="#818CF8" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#818CF8" }}>AI Prediction</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#F1F5F9" }}>{Math.round((order.breach_probability ?? 0) * 100)}% risk</span>
              </div>
              <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6 }}>{order.ai_prediction}</p>
              <div style={{ marginTop: 10, height: 6, background: "#1E1E35", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(order.breach_probability ?? 0) * 100}%`, background: (order.breach_probability ?? 0) > 0.7 ? "#F43F5E" : (order.breach_probability ?? 0) > 0.4 ? "#F59E0B" : "#10B981", borderRadius: 3 }} />
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Edit3 size={14} color="#818CF8" /> Update Status
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  style={{ background: "#14142A", border: "1px solid #1E1E35", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#F1F5F9", outline: "none", width: "100%" }}>
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
                <textarea value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} placeholder="Add a note (optional)..." rows={2}
                  style={{ background: "#14142A", border: "1px solid #1E1E35", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#F1F5F9", outline: "none", resize: "none", width: "100%", fontFamily: "inherit" }} />
                {(newStatus === "qc_failed" || newStatus === "reorder") && (
                  <textarea value={delayReason} onChange={(e) => setDelayReason(e.target.value)} placeholder="Delay reason (required)..." rows={2}
                    style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#F1F5F9", outline: "none", resize: "none", width: "100%", fontFamily: "inherit" }} />
                )}
                <button onClick={handleUpdate} disabled={updating}
                  style={{ padding: "10px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${success ? "rgba(16,185,129,0.3)" : "rgba(129,140,248,0.3)"}`, background: success ? "rgba(16,185,129,0.1)" : "rgba(129,140,248,0.1)", color: success ? "#10B981" : "#818CF8", transition: "all 0.2s" }}>
                  {updating ? "Updating..." : success ? "✓ Status Updated" : "Update Order Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}