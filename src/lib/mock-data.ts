import { Order, LensInventory, BreachAlert, DashboardStats, OrderStatus, LensType, LensIndex, CoatingType, StoreLocation, SLA_HOURS, StatusEvent } from "@/types";

const STORES: StoreLocation[] = [
  "Mumbai - Andheri","Mumbai - Bandra","Delhi - Connaught Place",
  "Delhi - Lajpat Nagar","Bangalore - Indiranagar","Bangalore - Koramangala",
  "Chennai - T.Nagar","Hyderabad - Banjara Hills",
];
const LENS_TYPES: LensType[] = ["single_vision","bifocal","progressive","blue_cut","photochromic"];
const LENS_INDICES: LensIndex[] = ["1.50","1.56","1.61","1.67","1.74"];
const COATINGS: CoatingType[] = ["anti_reflective","anti_scratch","uv_protection","blue_cut","hydrophobic","combo"];
const STATUSES: OrderStatus[] = ["order_placed","prescription_verified","lens_cutting","coating","qc_check","qc_failed","assembly","dispatch_ready","dispatched","delivered"];
const NAMES = ["Arjun Mehta","Priya Sharma","Rahul Verma","Anjali Singh","Vikram Nair","Deepa Krishnan","Aditya Patel","Sneha Reddy","Karan Malhotra","Divya Iyer","Rohan Gupta","Pooja Agarwal","Siddharth Joshi","Neha Kapoor","Varun Bhat","Kavya Menon","Arnav Choudhary","Ishita Banerjee","Manish Tiwari","Riya Desai"];
const FRAMES = ["EL-PRO-2401","EL-SLIM-1802","EL-ROUND-3301","EL-CAT-2201","EL-AVIATOR-1501","EL-RECT-4401"];
const COLORS = ["Midnight Black","Gunmetal Silver","Tortoise Brown","Crystal Clear","Rose Gold","Matte Navy"];

const r = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rb = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600000).toISOString();

function genHistory(status: OrderStatus, createdAt: string): StatusEvent[] {
  const flow: OrderStatus[] = ["order_placed","prescription_verified","lens_cutting","coating","qc_check","assembly","dispatch_ready","dispatched"];
  const idx = flow.indexOf(status);
  if (idx === -1) return [];
  let time = new Date(createdAt).getTime();
  return flow.slice(0, idx + 1).map((s) => {
    time += rb(1, 4) * 3600000;
    return { status: s, timestamp: new Date(time).toISOString(), updated_by: r(["Ravi Kumar","Sunita Patel","Mohammed Ali","System Auto"]) };
  });
}

export function generateMockOrders(count = 40): Order[] {
  return Array.from({ length: count }, (_, i) => {
    const lensType = r(LENS_TYPES);
    const slaHours = SLA_HOURS[lensType];
    const hoursElapsed = rb(2, slaHours + 12);
    const createdAt = hoursAgo(hoursElapsed);
    const status = r(STATUSES);
    const hoursLeft = slaHours - hoursElapsed;
    const bp = hoursLeft < 0 ? 0.95 : hoursLeft < slaHours * 0.2 ? 0.75 : hoursLeft < slaHours * 0.4 ? 0.4 : 0.1;
    return {
      id: `order_${i + 1}`,
      order_number: `EL-${String(2024001 + i).padStart(7, "0")}`,
      customer_name: r(NAMES),
      customer_phone: `+91 ${rb(7000000000, 9999999999)}`,
      customer_email: `customer${i + 1}@example.com`,
      store_location: r(STORES),
      prescription: {
        right_sph: parseFloat((rb(-800, 400) / 100).toFixed(2)),
        right_cyl: parseFloat((rb(-300, 0) / 100).toFixed(2)),
        right_axis: rb(0, 180),
        left_sph: parseFloat((rb(-800, 400) / 100).toFixed(2)),
        left_cyl: parseFloat((rb(-300, 0) / 100).toFixed(2)),
        left_axis: rb(0, 180),
        pd: rb(58, 70),
      },
      lens_type: lensType,
      lens_index: r(LENS_INDICES),
      coating: r(COATINGS),
      frame_model: r(FRAMES),
      frame_color: r(COLORS),
      status,
      sla_hours: slaHours,
      created_at: createdAt,
      updated_at: hoursAgo(rb(0, hoursElapsed)),
      estimated_delivery: hoursFromNow(Math.max(0, hoursLeft)),
      status_history: genHistory(status, createdAt),
      delay_reason: status === "qc_failed" ? "Coating defect detected" : undefined,
      is_in_house: Math.random() > 0.3,
      breach_probability: parseFloat(bp.toFixed(2)),
      ai_prediction: bp > 0.6 ? "High risk: SLA breach likely within 4 hours" : bp > 0.3 ? "Moderate risk: Monitor closely" : "On track within SLA window",
      source: r(["in-store","online","phone"]),
      price: rb(2500, 18000),
    };
  });
}

export function generateMockInventory(): LensInventory[] {
  const items: LensInventory[] = [];
  let id = 1;
  LENS_TYPES.forEach((lt) => {
    LENS_INDICES.forEach((li) => {
      [-6,-4,-2,-1,0,1,2,4].forEach((sph) => {
        items.push({
          id: `inv_${id++}`, lens_type: lt, lens_index: li,
          power_sph: sph, power_cyl: r([-2,-1.5,-1,-0.5,0]),
          coating: r(COATINGS), quantity: rb(0, 25),
          reorder_threshold: 5,
          last_restocked: hoursAgo(rb(24, 720)),
          location: Math.random() > 0.4 ? "warehouse" : "store",
        });
      });
    });
  });
  return items;
}

export function generateMockAlerts(orders: Order[]): BreachAlert[] {
  return orders.filter((o) => (o.breach_probability ?? 0) > 0.4).slice(0, 12).map((o, i) => {
    const prob = o.breach_probability ?? 0.5;
    const severity = prob > 0.85 ? "critical" : prob > 0.7 ? "high" : prob > 0.5 ? "medium" : "low";
    const hoursElapsed = (Date.now() - new Date(o.created_at).getTime()) / 3600000;
    return {
      id: `alert_${i + 1}`, order_id: o.id, order_number: o.order_number,
      customer_name: o.customer_name, store_location: o.store_location,
      breach_probability: prob, current_status: o.status,
      hours_remaining: parseFloat((o.sla_hours - hoursElapsed).toFixed(1)),
      ai_reason: o.ai_prediction ?? "SLA breach risk detected",
      created_at: hoursAgo(rb(0, 3)), acknowledged: Math.random() > 0.6, severity,
    };
  });
}

export function generateDashboardStats(orders: Order[]): DashboardStats {
  const active = orders.filter((o) => o.status !== "delivered");
  const breached = active.filter((o) => (o.breach_probability ?? 0) > 0.85);
  const atRisk = active.filter((o) => (o.breach_probability ?? 0) > 0.4 && (o.breach_probability ?? 0) <= 0.85);
  const onTrack = active.filter((o) => (o.breach_probability ?? 0) <= 0.4);
  return {
    total_active: active.length, on_track: onTrack.length,
    at_risk: atRisk.length, breached: breached.length,
    delivered_today: rb(8, 24),
    avg_tat_hours: parseFloat((orders.reduce((a, o) => a + o.sla_hours, 0) / orders.length).toFixed(1)),
    in_house_rate: parseFloat(((orders.filter((o) => o.is_in_house).length / orders.length) * 100).toFixed(1)),
    qc_pass_rate: parseFloat(((orders.filter((o) => o.status !== "qc_failed").length / orders.length) * 100).toFixed(1)),
  };
}