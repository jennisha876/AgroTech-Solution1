import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { makeId, nowIso, readJson, writeJson } from "../utils/db.js";

const router = Router();

const reviewSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(500),
});

router.get("/mine", requireAuth, async (req, res) => {
  const reviews = await readJson("reviews.json", []);
  return res.json({ reviews: reviews.filter((r) => r.userId === req.user.id) });
});

router.post("/", requireAuth, async (req, res) => {
  const parseResult = reviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return res.status(400).json({ message: issue?.message || "Invalid review data" });
  }

  const reviews = await readJson("reviews.json", []);
  const existing = reviews.find(
    (r) =>
      r.userId === req.user.id &&
      r.orderId === parseResult.data.orderId &&
      r.productId === parseResult.data.productId
  );

  if (existing) {
    return res.status(409).json({ message: "You already reviewed this product from this order" });
  }

  const review = {
    id: makeId("rev"),
    userId: req.user.id,
    ...parseResult.data,
    createdAt: nowIso(),
  };

  reviews.push(review);
  await writeJson("reviews.json", reviews);

  return res.status(201).json({ review });
});

export default router;
