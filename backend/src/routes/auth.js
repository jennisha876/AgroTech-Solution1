import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signToken } from "../middleware/auth.js";
import { isValidParish } from "../utils/parishes.js";
import { makeId, nowIso, readJson, writeJson } from "../utils/db.js";

const router = Router();

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only use letters, numbers, and underscore");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  username: usernameSchema,
  email: z.string().email("Please provide a valid email address"),
  password: passwordSchema,
  userType: z.enum(["farmer", "buyer", "admin"]),
  location: z
    .string()
    .optional()
    .default("")
    .refine((value) => isValidParish(value), "Location must be a valid Jamaica parish"),
  phone: z.string().optional().default(""),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

router.post("/register", async (req, res) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return res.status(400).json({
      message: issue?.message || "Invalid registration data",
      field: issue?.path?.[0] || null,
      errors: parseResult.error.flatten(),
    });
  }

  const users = await readJson("users.json", []);
  const payload = parseResult.data;
  const emailTaken = users.some(
    (u) => u.email.toLowerCase() === payload.email.toLowerCase() && u.userType === payload.userType
  );
  const usernameTaken = users.some((u) => u.username.toLowerCase() === payload.username.toLowerCase());

  if (emailTaken) {
    return res.status(409).json({ message: `Email already exists for ${payload.userType} account` });
  }
  if (usernameTaken) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = {
    id: makeId("usr"),
    name: payload.name,
    username: payload.username,
    email: payload.email,
    passwordHash,
    userType: payload.userType,
    location: payload.location,
    phone: payload.phone,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  users.push(user);
  await writeJson("users.json", users);

  const token = signToken(user);
  return res.status(201).json({ token, user: { ...user, passwordHash: undefined } });
});

router.post("/login", async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return res.status(400).json({ message: issue?.message || "Invalid login data", field: issue?.path?.[0] || null });
  }

  const users = await readJson("users.json", []);
  const identifier = parseResult.data.identifier.toLowerCase();
  const candidates = users.filter(
    (u) => u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier
  );

  if (candidates.length === 0) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const passwordMatches = [];
  for (const candidate of candidates) {
    const ok = await bcrypt.compare(parseResult.data.password, candidate.passwordHash);
    if (ok) {
      passwordMatches.push(candidate);
    }
  }

  if (passwordMatches.length === 0) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (passwordMatches.length > 1 && identifier.includes("@")) {
    return res.status(409).json({
      message: "Multiple accounts found for this email. Please log in using your username.",
    });
  }

  const user = passwordMatches[0];

  const token = signToken(user);
  return res.json({ token, user: { ...user, passwordHash: undefined } });
});

export default router;
