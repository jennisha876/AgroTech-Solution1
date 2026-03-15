import { Router } from "express";
import { products } from "../services/products.js";

const router = Router();

router.get("/", (req, res) => {
  const { search = "", category = "all", minPrice, maxPrice } = req.query;

  let filtered = [...products];

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.farmer.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  }

  if (category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }

  const min = minPrice ? Number(minPrice) : null;
  const max = maxPrice ? Number(maxPrice) : null;

  if (min !== null && !Number.isNaN(min)) {
    filtered = filtered.filter((p) => p.price >= min);
  }
  if (max !== null && !Number.isNaN(max)) {
    filtered = filtered.filter((p) => p.price <= max);
  }

  return res.json({ products: filtered });
});

export default router;
