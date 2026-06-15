# Eluno OMS — Architecture Documentation

## System Overview
AI-powered order management system for eyewear brand Eluno. Tracks orders through 10 lifecycle stages with AI-driven SLA breach predictions.

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend:** Next.js API Routes, Supabase PostgreSQL
- **AI:** Groq LLaMA 3.3 70B (SLA predictions)
- **Alerts:** Resend (email notifications)
- **Deployment:** Vercel

## Core Modules

### 1. Lens Inventory Management
- Real-time stock tracking by lens type, power, coating
- In-house availability check with ±0.25D tolerance
- Low stock alerts and reorder thresholds
- **Tables:** `lens_inventory`

### 2. Order Dashboard & Status Tracking
- 40+ concurrent orders with live SLA countdown rings
- 10-stage order lifecycle (order_placed → delivered)
- Real-time status updates with team audit trail
- Filterable by status, lens type, store location
- **Tables:** `orders`, `status_history`

### 3. AI-Driven TAT Prediction & Breach Alerts
- Groq LLaMA 3.3 70B analyzes order context + history
- Predicts SLA breach probability (0-100%)
- Severity classification: low/medium/high/critical
- Email alerts via Resend for critical breaches
- **Tables:** `breach_alerts`
- **API:** `/api/predict` (POST)

## Database Schema

### orders
- 1000+ fields including prescription, frame, coating
- Tracks breach_probability and AI predictions
- Auto-updated_at timestamp

### breach_alerts
- Links orders to predictions
- Stores severity, hours_remaining, AI reasoning
- Acknowledgment tracking for team

### lens_inventory
- 100+ SKUs across 5 lens types, 5 indices
- Quantity, location, reorder_threshold

## API Routes
- `GET /api/orders` — fetch all orders with filters
- `PATCH /api/orders/[id]` — update order status
- `GET /api/inventory` — lens stock levels
- `POST /api/inventory` — in-house availability check
- `GET /api/alerts` — breach alerts feed
- `POST /api/predict` — AI SLA prediction (Groq)

## Performance
- SLA countdown rings update every 30 seconds
- Real-time animations (Framer Motion)
- Lazy-loaded tables with 8-row preview
- Numbers animate on first load

## Security
- Supabase RLS disabled (dev) — enable before production
- API key in .env.local (never commit)
- Public anon key for read-only (appropriate for this phase)

## Future Enhancements
- WhatsApp alerts via Twilio
- ML model for breach prediction (vs rule-based Groq)
- Multi-user authentication + role-based access
- Historical analytics dashboard
- Integration with actual ERP systems

## Deployment
- Live: https://eluno-ops.vercel.app
- Database: Supabase (Singapore region)
- Demo: https://www.loom.com/share/8a53db78e29e4fe7ba13b9c89caff9ee
