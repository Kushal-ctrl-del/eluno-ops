import { supabase } from "./supabase";
import { generateMockOrders, generateMockInventory } from "./mock-data";

export async function seedDatabase() {
  const orders = generateMockOrders(40);
  const inventory = generateMockInventory();

  // Seed orders
  for (const order of orders) {
    const { data, error } = await supabase.from("orders").insert({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      store_location: order.store_location,
      prescription: order.prescription,
      lens_type: order.lens_type,
      lens_index: order.lens_index,
      coating: order.coating,
      frame_model: order.frame_model,
      frame_color: order.frame_color,
      status: order.status,
      sla_hours: order.sla_hours,
      estimated_delivery: order.estimated_delivery,
      delay_reason: order.delay_reason,
      is_in_house: order.is_in_house,
      breach_probability: order.breach_probability,
      ai_prediction: order.ai_prediction,
      source: order.source,
      price: order.price,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }).select().single();

    if (error) { console.error("Order seed error:", error); continue; }

    // Seed status history
    if (data && order.status_history.length > 0) {
      await supabase.from("status_history").insert(
        order.status_history.map((h) => ({
          order_id: data.id,
          status: h.status,
          updated_by: h.updated_by,
          note: h.note,
          created_at: h.timestamp,
        }))
      );
    }
  }

  // Seed inventory
  const inventoryRows = inventory.slice(0, 100).map((item) => ({
    lens_type: item.lens_type,
    lens_index: item.lens_index,
    power_sph: item.power_sph,
    power_cyl: item.power_cyl,
    coating: item.coating,
    quantity: item.quantity,
    reorder_threshold: item.reorder_threshold,
    location: item.location,
    last_restocked: item.last_restocked,
  }));

  await supabase.from("lens_inventory").insert(inventoryRows);
  console.log("✅ Database seeded successfully");
}