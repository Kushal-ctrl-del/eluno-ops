import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  const { order } = await request.json();

  const prompt = `You are an AI system for an eyewear order management system called Eluno.

Analyze this order and predict if it will breach its SLA:

Order: ${order.order_number}
Lens Type: ${order.lens_type} (SLA: ${order.sla_hours} hours)
Current Status: ${order.status}
Hours Elapsed: ${Math.floor((Date.now() - new Date(order.created_at).getTime()) / 3600000)}h
Hours Remaining: ${Math.max(0, order.sla_hours - Math.floor((Date.now() - new Date(order.created_at).getTime()) / 3600000))}h
Is In-House Lens: ${order.is_in_house}
Status History Count: ${order.status_history?.length || 0} stages completed
QC Failed: ${order.status === 'qc_failed'}

Respond ONLY with a JSON object, no markdown:
{
  "breach_probability": 0.0 to 1.0,
  "severity": "low" or "medium" or "high" or "critical",
  "prediction": "one sentence explanation",
  "recommendation": "one sentence action item"
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 200,
    });

    const text = completion.choices[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ breach_probability: 0.5, severity: "medium", prediction: "Unable to predict", recommendation: "Monitor order closely" });
  }
}