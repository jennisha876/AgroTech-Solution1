import { Router } from "express";
import { z } from "zod";

const router = Router();

const schema = z.object({
  message: z.string().trim().min(1),
  imageDataUrl: z.string().trim().optional(),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1),
  })).optional().default([]),
});

async function callOpenAi(message, history = [], imageDataUrl) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const userMessage = imageDataUrl
    ? {
        role: "user",
        content: [
          { type: "text", text: message },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      }
    : { role: "user", content: message };

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
            "You are TechGro, a ChatGPT-style AI assistant dedicated to farming. Help with crop planning, disease detection, pest control, fertilizer decisions, irrigation, soil care, weather risk, farm records, produce quality, post-harvest handling, and practical farm operations. Stay grounded, ask follow-up questions when context is missing, and give concise step-by-step recommendations that a farmer can act on quickly. When an image is provided, use it as evidence but mention uncertainty if the image is inconclusive.",
        },
        ...history,
        userMessage,
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
  if (lower.includes("soil") || lower.includes("fertilizer") || lower.includes("compost") || lower.includes("nutrient")) {
    return "For soil and fertilizer decisions: 1) identify crop and growth stage, 2) check recent rainfall or irrigation, 3) confirm soil condition or test results if available, 4) avoid over-applying nitrogen, 5) apply in smaller monitored doses when uncertain. Tell me your crop, acreage, and current symptoms and I will suggest a field-ready plan.";
  }
  if (lower.includes("irrigation") || lower.includes("drip") || lower.includes("watering")) {
    return "For irrigation planning: 1) check crop stage, 2) estimate soil moisture and drainage, 3) adjust for heat, wind, and recent rain, 4) water deeply and consistently rather than lightly and often for most field crops. Tell me your crop, soil type, and current weather and I will suggest a schedule.";
  }
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
  if (lower.includes("harvest") || lower.includes("post-harvest") || lower.includes("storage") || lower.includes("packing")) {
    return "For harvest and post-harvest handling: 1) harvest at the correct maturity stage, 2) remove damaged produce early, 3) keep produce shaded and cool, 4) separate by quality grade, 5) package to reduce bruising and moisture buildup. Tell me the crop and sales destination and I will tailor the steps.";
  }
  if (lower.includes("price") || lower.includes("market")) {
    return "Compare product prices by category and location in the buyer dashboard. Filter by price range to find cost-effective suppliers.";
  }
  if (lower.includes("crop") || lower.includes("plant")) {
    return "Track each crop status weekly and update notes after field checks. This improves harvest planning and alert relevance.";
  }
  return "I am TechGro. I can help with crop care, pests, diseases, irrigation, soil, produce quality, harvest timing, and everyday farm decisions. Tell me your crop, symptoms, farm goal, or upload an image and I will guide you step by step.";
}

router.post("/chat", async (req, res) => {
  const parseResult = schema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    const ai = await callOpenAi(parseResult.data.message, parseResult.data.messages, parseResult.data.imageDataUrl);
    return res.json({ reply: ai || fallbackReply(parseResult.data.message) });
  } catch {
    return res.json({ reply: fallbackReply(parseResult.data.message) });
  }
});

export default router;
