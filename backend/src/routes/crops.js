import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { makeId, nowIso, readJson, writeJson } from "../utils/db.js";

const router = Router();

const cropSchema = z.object({
  name: z.string().trim().min(1),
  variety: z.string().optional().default(""),
  areaSize: z.number().nonnegative(),
  plantingDate: z.string().optional().default(""),
  expectedHarvest: z.string().optional().default(""),
  status: z.enum(["planted", "growing", "ready", "harvested"]),
  notes: z.string().optional().default(""),
});

router.get("/", requireAuth, async (req, res) => {
  const crops = await readJson("crops.json", []);
  const result = crops.filter((crop) => crop.userId === req.user.id);
  return res.json({ crops: result });
});

router.post("/", requireAuth, async (req, res) => {
  const parseResult = cropSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid crop data" });
  }

  const crops = await readJson("crops.json", []);
  const newCrop = {
    id: makeId("crop"),
    ...parseResult.data,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    userId: req.user.id,
  };

  crops.push(newCrop);
  await writeJson("crops.json", crops);
  return res.status(201).json({ crop: newCrop });
});

router.put("/:id", requireAuth, async (req, res) => {
  const parseResult = cropSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid crop data" });
  }

  const crops = await readJson("crops.json", []);
  const index = crops.findIndex((c) => c.id === req.params.id && c.userId === req.user.id);

  if (index === -1) {
    return res.status(404).json({ message: "Crop not found" });
  }

  crops[index] = {
    ...crops[index],
    ...parseResult.data,
    updatedAt: nowIso(),
  };

  await writeJson("crops.json", crops);
  return res.json({ crop: crops[index] });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const crops = await readJson("crops.json", []);
  const before = crops.length;
  const filtered = crops.filter((c) => !(c.id === req.params.id && c.userId === req.user.id));

  if (filtered.length === before) {
    return res.status(404).json({ message: "Crop not found" });
  }

  await writeJson("crops.json", filtered);
  return res.json({ message: "Crop deleted" });
});

export default router;
