import { Router } from "express";
import { z } from "zod";

const router = Router();

const schema = z.object({
  message: z.string().trim().min(1),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1),
  })).optional().default([]),
});

async function callOpenAi(message, history = []) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are TechGro, a farmer assistant with ChatGPT-style conversational continuity. Focus on crop disease detection, practical treatment steps, faulty produce detection, crop quality checks, and weather risk guidance. Give concise, step-by-step, field-ready recommendations.",
        },
        ...history,
        { role: "user", content: message },
      ],
      temperature: 0.6,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

function fallbackReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes("disease") || lower.includes("leaf spot") || lower.includes("blight") || lower.includes("yellow") || lower.includes("pest") || lower.includes("fungus")) {
    return "For possible disease detection: 1) identify symptoms (leaf spots, wilting, discoloration, stem rot), 2) isolate affected plants, 3) improve airflow and drainage, 4) remove infected tissue, 5) apply crop-appropriate treatment (bio-fungicide or registered fungicide), 6) track progress daily for 7 days. Share crop type and exact symptoms and I will suggest a specific treatment plan.";
  }
  if (lower.includes("vertical farming") || lower.includes("traditional farming") || lower.includes("aquaponics") || lower.includes("hydroponics")) {
    return "Choose method by constraints: Vertical farming = high control and limited land, higher setup cost. Traditional farming = lower setup cost, larger land, weather exposure. Aquaponics = fish + plants in recirculating water, strong water efficiency, moderate technical skill required. Tell me your budget, land size, and crop goals and I will recommend the best option.";
  }
  if (lower.includes("fault") || lower.includes("rotten") || lower.includes("spoil") || lower.includes("quality")) {
    return "Check color uniformity, smell, firmness, bruising, mold spots, and moisture damage. Separate suspect produce immediately and log affected batches.";
  }
  if (lower.includes("weather")) {
    return "Use the Weather tab to check live conditions and alerts. For irrigation planning, focus on rainfall and max temperature trends.";
  }
  if (lower.includes("price") || lower.includes("market")) {
    return "Compare product prices by category and location in the buyer dashboard. Filter by price range to find cost-effective suppliers.";
  }
  if (lower.includes("crop") || lower.includes("plant")) {
    return "Track each crop status weekly and update notes after field checks. This improves harvest planning and alert relevance.";
  }
  return "I am TechGro. I can help with produce quality checks, weather risk planning, and crop decisions. Tell me your exact farm situation and I will guide you step by step.";
}

router.post("/chat", async (req, res) => {
  const parseResult = schema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    const ai = await callOpenAi(parseResult.data.message, parseResult.data.messages);
    return res.json({ reply: ai || fallbackReply(parseResult.data.message) });
  } catch {
    return res.json({ reply: fallbackReply(parseResult.data.message) });
  }
});

export default router;
