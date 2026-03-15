import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { readJson } from "../utils/db.js";

const router = Router();

router.get("/overview", requireAuth, requireAdmin, async (_, res) => {
  const users = await readJson("users.json", []);
  const orders = await readJson("orders.json", []);
  const reviews = await readJson("reviews.json", []);
  const resets = await readJson("passwordResets.json", []);

  return res.json({
    users: users.length,
    buyers: users.filter((u) => u.userType === "buyer").length,
    farmers: users.filter((u) => u.userType === "farmer").length,
    admins: users.filter((u) => u.userType === "admin").length,
    orders: orders.length,
    reviews: reviews.length,
    pendingResets: resets.filter((r) => r.status === "pending").length,
  });
});

export default router;
