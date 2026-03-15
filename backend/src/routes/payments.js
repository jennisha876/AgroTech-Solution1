import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";

const router = Router();

const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("usd"),
  metadata: z.record(z.string()).optional(),
});

router.post("/create-intent", async (req, res) => {
  const parseResult = paymentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid payment payload" });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.json({
      provider: "mock",
      status: "mock_success",
      amount: parseResult.data.amount,
      currency: parseResult.data.currency,
      paymentIntentId: `mock_pi_${Date.now()}`,
      clientSecret: "mock_client_secret",
      message: "Stripe key missing. Payment simulated successfully for development.",
    });
  }

  try {
    const stripe = new Stripe(stripeKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseResult.data.amount * 100),
      currency: parseResult.data.currency,
      metadata: parseResult.data.metadata,
      automatic_payment_methods: { enabled: true },
    });

    return res.json({
      provider: "stripe",
      status: paymentIntent.status,
      amount: parseResult.data.amount,
      currency: parseResult.data.currency,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch {
    return res.status(500).json({ message: "Unable to create payment intent" });
  }
});

export default router;
