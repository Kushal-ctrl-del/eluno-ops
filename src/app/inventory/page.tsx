"use client";
import { useMemo, useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { generateMockInventory, generateMockOrders, generateMockAlerts } from "@/lib/mock-data";
import { LENS_TYPE_LABELS, LensType, LensIndex } from "@/types";
import { Package, AlertTriangle, CheckCircle, Search, TrendingDown, Zap } from "lucide-react";

export default function InventoryPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const inventory = useMemo(() => generateMockInventory(), []);
  const orders = useMemo(() => generateMockOrders(40), []);
  const alerts = useMemo(() => generateMockAlerts(orders), [orders]);
  const criticalCount = alerts.filter((a) => !a.acknowledged && a.severity === "critical").length;
  const [lensFilter, setLensFilter] = useState("all");
  const [indexFilter, setIndexFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [checkSph, setCheckSph] = useState("");
  const [checkCyl, setCheckCyl] = useState("");
  const [checkType, setCheckType] = useState<LensType>("single_vision");
  const [checkResult, setCheckResult] = useState<null|{found:boolean;qty?:number;loc?:string}>(null);

  const LENS_TYPES: LensType[] = ["single_vision","bifocal","progressive","blue_cut","photochromic"];
  const LENS_INDICES: LensIndex[] = ["1.50","1.56","1.61","1.67","1.74"];

  const filtered = useMemo(() => inventory.filter((item) => {
    if (lensFilter !== "all" && item.lens_type !== lensFilter) return false;
    if (indexFilter !== "all" && item.lens_index !== indexFilter) return false;
    if (search && !LENS_TYPE_LABELS[item.lens_type].toLowerCase().includes(search.toLowerCase()) && !String(item.power_sph).includes(search)) return false;
    return true;
  }).slice(0, 80), [inventory, lensFilter, indexFilter, search]);

  const lowStock = inventory.filter((i) => i.quantity <= i.reorder_threshold && i.quantity > 0);
  const outOfStock = inventory.filter((i) => i.quantity === 0);

  const handleCheck = () => {
    const sph = parseFloat(checkSph);
    const cyl = parseFloat(checkCyl);
    const found = inventory.find((i) => i.lens_type === checkType && Math.abs(i.power_sph - sph) <= 0.25 && Math.abs(i.power_cyl - cyl) <= 0.25 && i.quantity > 0);
    setCheckResult(found ? { found: true, qty: found.quantity, loc: found.location } : { found: false });
  };

  if (!mounted) return null;

  const selectStyle = { background: "#14142A", border: "1px solid #1E1E35", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#94A3B8", outline: "none", cursor: "pointer" };

  return (
    <AppLayout title="Lens Inventory" subtitle="Real-time stock · in-house check" alertCount={criticalCount}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[
            { label: "Total SKUs", value: inventory.length, color: "#818CF8", bg: "rgba(129,140,248,0.1)", icon: Package },
            { label: "Low Stock", value: lowStock.length, color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: TrendingDown },
            { label: "Out of Stock", value: outOfStock.length, color: "#F43F5E", bg: "rgba(244,63,94,0.1)", icon: AlertTriangle },
            { label: "In-House Orders", value: orders.filter((o) => o.is_in_house).length, color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle },
          ].map((s) => (
            <div key={s.label} style={{ background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35", padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div>
                <p style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "#475569" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* In-house check */}
        <div style={{ background: "linear-gradient(135deg,rgba(129,140,248,0.1),rgba(34,211,238,0.05))", borderRadius: 12, border: "1px solid rgba(129,140,248,0.2)", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Zap size={15} color="#818CF8" />
            <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>In-House Availability Check</h3>
            <span style={{ fontSize: 11, color: "#475569" }}>· Enter prescription to check stock</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: 10, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Lens Type</p>
              <select value={checkType} onChange={(e) => setCheckType(e.target.value as LensType)} style={selectStyle}>
                {LENS_TYPES.map((t) => <option key={t} value={t}>{LENS_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <p style={{ fontSize: 10, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>SPH</p>
              <input value={checkSph} onChange={(e) => setCheckSph(e.target.value)} placeholder="-2.00" style={{ ...selectStyle, width: 90 }} />
            </div>
            <div>
              <p style={{ fontSize: 10, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>CYL</p>
              <input value={checkCyl} onChange={(e) => setCheckCyl(e.target.value)} placeholder="-0.75" style={{ ...selectStyle, width: 90 }} />
            </div>
            <button onClick={handleCheck} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.15)", color: "#818CF8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Check Stock
            </button>
            {checkResult && (
              <div style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${checkResult.found ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"}`, background: checkResult.found ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)", color: checkResult.found ? "#10B981" : "#F43F5E", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {checkResult.found ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                {checkResult.found ? `✓ In stock · ${checkResult.qty} units · ${checkResult.loc}` : "Not in stock — external sourcing required"}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 16, background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
            <Search size={13} color="#475569" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lens or power..." style={{ ...selectStyle, width: "100%", paddingLeft: 32 }} />
          </div>
          <select value={lensFilter} onChange={(e) => setLensFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Types</option>
            {LENS_TYPES.map((l) => <option key={l} value={l}>{LENS_TYPE_LABELS[l]}</option>)}
          </select>
          <select value={indexFilter} onChange={(e) => setIndexFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Indices</option>
            {LENS_INDICES.map((i) => <option key={i} value={i}>Index {i}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: "#0F0F1A", borderRadius: 12, border: "1px solid #1E1E35", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E1E35" }}>
                  {["Lens Type","Index","SPH","CYL","Coating","Stock","Location","Restocked"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isOut = item.quantity === 0;
                  const isLow = item.quantity <= item.reorder_threshold && !isOut;
                  const color = isOut ? "#F43F5E" : isLow ? "#F59E0B" : "#10B981";
                  return (
                    <tr key={item.id} className="table-row-hover" style={{ borderBottom: "1px solid rgba(30,30,53,0.4)" }}>
                      <td style={{ padding: "10px 16px", fontSize: 12, color: "#F1F5F9", fontWeight: 500 }}>{LENS_TYPE_LABELS[item.lens_type]}</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, fontFamily: "monospace", color: "#94A3B8" }}>{item.lens_index}</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, fontFamily: "monospace", color: "#F1F5F9" }}>{item.power_sph > 0 ? `+${item.power_sph}` : item.power_sph}</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, fontFamily: "monospace", color: "#94A3B8" }}>{item.power_cyl}</td>
                      <td style={{ padding: "10px 16px", fontSize: 11, color: "#475569", textTransform: "capitalize" }}>{item.coating.replace(/_/g, " ")}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 48, height: 6, background: "#14142A", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.min(100,(item.quantity/25)*100)}%`, background: color, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color }}>{item.quantity}</span>
                          {isLow && <TrendingDown size={11} color="#F59E0B" />}
                          {isOut && <AlertTriangle size={11} color="#F43F5E" />}
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 11, color: item.location === "store" ? "#22D3EE" : "#475569", textTransform: "capitalize" }}>{item.location}</td>
                      <td style={{ padding: "10px 16px", fontSize: 11, color: "#475569" }}>{new Date(item.last_restocked).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}