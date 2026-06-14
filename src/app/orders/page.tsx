"use client";
import { useMemo, useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import SLARing from "@/components/ui/SLARing";
import { generateMockOrders, generateMockAlerts } from "@/lib/mock-data";
import { LENS_TYPE_LABELS, STATUS_LABELS, OrderStatus, LensType } from "@/types";
import { formatTimeAgo, formatCurrency } from "@/lib/utils";
import { Search, ArrowUpDown, Eye } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const orders = useMemo(() => generateMockOrders(40), []);
  const alerts = useMemo(() => generateMockAlerts(orders), [orders]);
  const criticalCount = alerts.filter((a) => !a.acknowledged && a.severity === "critical").length;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lensFilter, setLensFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"created"|"sla">("created");
  const stores = useMemo(() => [...new Set(orders.map((o) => o.store_location))], [orders]);
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (search && !o.customer_name.toLowerCase().includes(search.toLowerCase()) && !o.order_number.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (lensFilter !== "all" && o.lens_type !== lensFilter) return false;
      if (storeFilter !== "all" && o.store_location !== storeFilter) return false;
      return true;
    }).sort((a, b) => sortBy === "sla" ? (b.breach_probability ?? 0) - (a.breach_probability ?? 0) : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, search, statusFilter, lensFilter, storeFilter, sortBy]);

  if (!mounted) return null;

  const selectStyle = { background: "#14142A", border: "1px solid #1E1E35", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#94A3B8", outline: "none", cursor: "pointer" };
  const inputStyle = { ...selectStyle, flex: 1, minWidth: 200, paddingLeft: 32 };

  return (
    <AppLayout title="Orders" subtitle={`${filtered.length} orders`} alertCount={criticalCount}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 16, background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={13} color="#475569" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order or customer..." style={inputStyle} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Statuses</option>
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select value={lensFilter} onChange={(e) => setLensFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Lens Types</option>
            {(Object.keys(LENS_TYPE_LABELS) as LensType[]).map((l) => <option key={l} value={l}>{LENS_TYPE_LABELS[l]}</option>)}
          </select>
          <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Stores</option>
            {stores.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => setSortBy(sortBy === "created" ? "sla" : "created")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: `1px solid ${sortBy === "sla" ? "rgba(129,140,248,0.3)" : "#1E1E35"}`, background: sortBy === "sla" ? "rgba(129,140,248,0.1)" : "#14142A", color: sortBy === "sla" ? "#818CF8" : "#94A3B8", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            <ArrowUpDown size={11} /> {sortBy === "sla" ? "By SLA Risk" : "By Date"}
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E1E35" }}>
                  {["Order #","Customer","Lens Type","Status","SLA Timer","Store","Value",""].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="table-row-hover" style={{ borderBottom: "1px solid rgba(30,30,53,0.4)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: "#F1F5F9" }}>{order.order_number}</p>
                      <p style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{formatTimeAgo(order.created_at)}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "#F1F5F9" }}>{order.customer_name}</p>
                      <p style={{ fontSize: 10, color: "#475569", textTransform: "capitalize" }}>{order.source}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 11, color: "#94A3B8" }}>{LENS_TYPE_LABELS[order.lens_type]}</p>
                      <p style={{ fontSize: 10, color: "#475569" }}>idx {order.lens_index} · {order.sla_hours}h SLA</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={order.status} size="sm" />
                      {order.delay_reason && <p style={{ fontSize: 10, color: "#F43F5E", marginTop: 4 }}>{order.delay_reason}</p>}
                    </td>
                    <td style={{ padding: "12px 16px" }}><SLARing createdAt={order.created_at} slaHours={order.sla_hours} size={48} strokeWidth={3} showLabel={true} /></td>
                    <td style={{ padding: "12px 16px" }}><p style={{ fontSize: 10, color: "#475569", maxWidth: 110 }}>{order.store_location}</p></td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9" }}>{formatCurrency(order.price)}</p>
                      <p style={{ fontSize: 10, color: order.is_in_house ? "#10B981" : "#F59E0B" }}>{order.is_in_house ? "In-house" : "Outsourced"}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Link href={`/orders/${order.id}`}>
                        <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: "#818CF8", background: "transparent", border: "none", cursor: "pointer" }}>
                          <Eye size={12} /> View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div style={{ padding: 64, textAlign: "center", color: "#475569", fontSize: 13 }}>No orders match your filters</div>}
        </div>
      </div>
    </AppLayout>
  );
}