import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { makeId, nowIso, readJson, writeJson } from "../utils/db.js";

const router = Router();

const orderSchema = z.object({
  items: z.array(z.object({
    product: z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      unit: z.string(),
      farmer: z.string(),
      location: z.string(),
      stock: z.number(),
      category: z.string(),
      image: z.string(),
      description: z.string(),
    }),
    quantity: z.number().int().positive(),
  })).min(1),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  address: z.string().min(1),
  payment: z.object({
    status: z.enum(["mock_success", "requires_action", "failed"]),
    paymentIntentId: z.string().optional(),
    provider: z.string(),
  }),
});

router.get("/", requireAuth, async (req, res) => {
  const orders = await readJson("orders.json", []);
  const userOrders = orders
    .filter((o) => o.userId === req.user.id)
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  return res.json({ orders: userOrders });
});

router.post("/", requireAuth, async (req, res) => {
  const parseResult = orderSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid order payload" });
  }

  const total = parseResult.data.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const newOrder = {
    id: makeId("ord"),
    ...parseResult.data,
    total,
    status: "pending",
    userId: req.user.id,
    orderDate: nowIso(),
  };

  const orders = await readJson("orders.json", []);
  orders.push(newOrder);
  await writeJson("orders.json", orders);

  return res.status(201).json({ order: newOrder });
});

export default router;
