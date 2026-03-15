import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { makeId, nowIso, readJson, writeJson } from "../utils/db.js";

const router = Router();

const trainingSchema = z.object({
  type: z.enum(["online", "on-site"]),
  date: z.string(), // ISO date
});

// List all training sessions for the current farmer
router.get("/", requireAuth, async (req, res) => {
  const trainings = await readJson("trainings.json", []);
  const result = trainings.filter((t) => t.userId === req.user.id);
  return res.json({ trainings: result });
});

// Create a new training session (enforce limits in FarmerDashboard)
router.post("/", requireAuth, async (req, res) => {
  const parseResult = trainingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid training data" });
  }
  const trainings = await readJson("trainings.json", []);
  const newTraining = {
    id: makeId("train"),
    ...parseResult.data,
    userId: req.user.id,
    status: "scheduled",
    createdAt: nowIso(),
  };
  trainings.push(newTraining);
  await writeJson("trainings.json", trainings);
  return res.status(201).json({ training: newTraining });
});

export default router;
