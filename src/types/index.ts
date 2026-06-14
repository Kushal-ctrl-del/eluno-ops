export type OrderStatus =
  | "order_placed" | "prescription_verified" | "lens_cutting"
  | "coating" | "qc_check" | "qc_failed" | "reorder"
  | "assembly" | "dispatch_ready" | "dispatched" | "delivered";

export type LensType = "single_vision" | "bifocal" | "progressive" | "blue_cut" | "photochromic";
export type LensIndex = "1.50" | "1.56" | "1.61" | "1.67" | "1.74";
export type CoatingType = "anti_reflective" | "anti_scratch" | "uv_protection" | "blue_cut" | "hydrophobic" | "combo";
export type StoreLocation =
  | "Mumbai - Andheri" | "Mumbai - Bandra" | "Delhi - Connaught Place"
  | "Delhi - Lajpat Nagar" | "Bangalore - Indiranagar" | "Bangalore - Koramangala"
  | "Chennai - T.Nagar" | "Hyderabad - Banjara Hills";

export interface Prescription {
  right_sph: number; right_cyl: number; right_axis: number; right_add?: number;
  left_sph: number; left_cyl: number; left_axis: number; left_add?: number;
  pd: number;
}

export interface StatusEvent {
  status: OrderStatus; timestamp: string; updated_by: string; note?: string;
}

export interface Order {
  id: string; order_number: string; customer_name: string;
  customer_phone: string; customer_email: string;
  store_location: StoreLocation; prescription: Prescription;
  lens_type: LensType; lens_index: LensIndex; coating: CoatingType;
  frame_model: string; frame_color: string; status: OrderStatus;
  sla_hours: number; created_at: string; updated_at: string;
  estimated_delivery: string; status_history: StatusEvent[];
  delay_reason?: string; is_in_house: boolean;
  breach_probability?: number; ai_prediction?: string;
  source: "in-store" | "online" | "phone"; price: number;
}

export interface LensInventory {
  id: string; lens_type: LensType; lens_index: LensIndex;
  power_sph: number; power_cyl: number; coating: CoatingType;
  quantity: number; reorder_threshold: number;
  last_restocked: string; location: "warehouse" | "store";
}

export interface BreachAlert {
  id: string; order_id: string; order_number: string;
  customer_name: string; store_location: StoreLocation;
  breach_probability: number; current_status: OrderStatus;
  hours_remaining: number; ai_reason: string;
  created_at: string; acknowledged: boolean;
  severity: "low" | "medium" | "high" | "critical";
}

export interface DashboardStats {
  total_active: number; on_track: number; at_risk: number;
  breached: number; delivered_today: number; avg_tat_hours: number;
  in_house_rate: number; qc_pass_rate: number;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  order_placed: "Order Placed", prescription_verified: "Rx Verified",
  lens_cutting: "Lens Cutting", coating: "Coating", qc_check: "QC Check",
  qc_failed: "QC Failed", reorder: "Re-order", assembly: "Assembly",
  dispatch_ready: "Dispatch Ready", dispatched: "Dispatched", delivered: "Delivered",
};

export const STATUS_ORDER: OrderStatus[] = [
  "order_placed","prescription_verified","lens_cutting","coating",
  "qc_check","assembly","dispatch_ready","dispatched","delivered",
];

export const LENS_TYPE_LABELS: Record<LensType, string> = {
  single_vision: "Single Vision", bifocal: "Bifocal",
  progressive: "Progressive", blue_cut: "Blue Cut", photochromic: "Photochromic",
};

export const SLA_HOURS: Record<LensType, number> = {
  single_vision: 24, bifocal: 48, blue_cut: 36, progressive: 72, photochromic: 60,
};