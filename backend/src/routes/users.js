// --- Subscription update endpoint ---
const subscriptionSchema = z.object({
  subscriptionLevel: z.enum(["basic", "diamond", "platinum"]),
});

router.put("/subscription", requireAuth, async (req, res) => {
  const parseResult = subscriptionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid subscription data" });
  }
  const users = await readJson("users.json", []);
  const index = users.findIndex((u) => u.id === req.user.id);
  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }
  const user = users[index];
  if (user.userType !== "farmer") {
    return res.status(403).json({ message: "Only farmers can update subscription" });
  }
  const { subscriptionLevel } = parseResult.data;
  let trialEndsAt = user.trialEndsAt;
  // If switching plan, reset trial if not already expired
  const now = new Date();
  if (!trialEndsAt || new Date(trialEndsAt) < now) {
    const trial = new Date();
    trial.setDate(trial.getDate() + 30);
    trialEndsAt = trial.toISOString();
  }
  users[index] = {
    ...user,
    subscriptionLevel,
    subscriptionStatus: "trial",
    trialEndsAt,
    updatedAt: nowIso(),
  };
  await writeJson("users.json", users);
  return res.json({
    message: "Subscription updated",
    user: { ...users[index], passwordHash: undefined },
  });
});
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth, signToken } from "../middleware/auth.js";
import { isValidParish } from "../utils/parishes.js";
import { makeId, nowIso, readJson, writeJson } from "../utils/db.js";

const router = Router();

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only use letters, numbers, and underscore");

const strongPasswordSchema = z
  .string()
  .min(8, "New password must be at least 8 characters")
  .regex(/[a-z]/, "New password must include a lowercase letter")
  .regex(/[A-Z]/, "New password must include an uppercase letter")
  .regex(/[0-9]/, "New password must include a number")
  .regex(/[^A-Za-z0-9]/, "New password must include a special character");

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  username: usernameSchema.optional(),
  email: z.string().email("Please provide a valid email address").optional(),
  location: z
    .string()
    .optional()
    .refine((value) => isValidParish(value), "Location must be a valid Jamaica parish"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: strongPasswordSchema,
});

const resetRequestSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your email or username"),
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required"),
  newPassword: strongPasswordSchema,
});

const switchRoleSchema = z.object({
  targetRole: z.enum(["farmer", "buyer"]),
});

router.get("/me", requireAuth, async (req, res) => {
  const users = await readJson("users.json", []);
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: { ...user, passwordHash: undefined } });
});

router.put("/profile", requireAuth, async (req, res) => {
  const parseResult = profileSchema.safeParse(req.body);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return res.status(400).json({ message: issue?.message || "Invalid profile data", field: issue?.path?.[0] || null });
  }

  const users = await readJson("users.json", []);
  const index = users.findIndex((u) => u.id === req.user.id);
  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const current = users[index];
  const updates = parseResult.data;

  if (updates.email && updates.email.toLowerCase() !== current.email.toLowerCase()) {
    const exists = users.some(
      (u) =>
        u.id !== current.id &&
        u.userType === current.userType &&
        u.email.toLowerCase() === updates.email.toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ message: `Email already exists for ${current.userType} account` });
    }
  }

  if (updates.username && updates.username.toLowerCase() !== current.username.toLowerCase()) {
    const exists = users.some((u) => u.id !== current.id && u.username.toLowerCase() === updates.username.toLowerCase());
    if (exists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  }

  const updatedUser = {
    ...current,
    ...updates,
    updatedAt: nowIso(),
  };

  users[index] = updatedUser;
  await writeJson("users.json", users);

  const token = signToken(updatedUser);
  return res.json({ token, user: { ...updatedUser, passwordHash: undefined } });
});

router.put("/password", requireAuth, async (req, res) => {
  const parseResult = passwordSchema.safeParse(req.body);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return res.status(400).json({ message: issue?.message || "Invalid password request", field: issue?.path?.[0] || null });
  }

  const users = await readJson("users.json", []);
  const index = users.findIndex((u) => u.id === req.user.id);
  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const current = users[index];
  const matches = await bcrypt.compare(parseResult.data.currentPassword, current.passwordHash);
  if (!matches) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  users[index].passwordHash = await bcrypt.hash(parseResult.data.newPassword, 12);
  users[index].updatedAt = nowIso();
  await writeJson("users.json", users);

  return res.json({ message: "Password updated successfully" });
});

router.post("/password-reset-request", async (req, res) => {
  const parseResult = resetRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return res.status(400).json({ message: issue?.message || "Invalid reset request", field: issue?.path?.[0] || null });
  }

  const users = await readJson("users.json", []);
  const resets = await readJson("passwordResets.json", []);

  const identifier = parseResult.data.identifier.toLowerCase();
  const user = users.find(
    (u) => u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier
  );
  let resetToken;
  let resetLink;
  if (user) {
    const token = makeId("reset_token");
    const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
    resetToken = token;
    resetLink = `${frontendOrigin}/reset-password?token=${encodeURIComponent(token)}`;
    resets.push({
      id: makeId("reset"),
      userId: user.id,
      email: user.email,
      username: user.username,
      token,
      resetLink,
      status: "pending",
      requestedAt: nowIso(),
    });
    await writeJson("passwordResets.json", resets);
  }

  return res.json({
    message: "If this account exists, a reset link has been generated",
    resetToken: resetToken || null,
    resetLink: resetLink || null,
  });
});

router.post("/password-reset", async (req, res) => {
  const parseResult = resetPasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return res.status(400).json({ message: issue?.message || "Invalid reset payload" });
  }

  const resets = await readJson("passwordResets.json", []);
  const users = await readJson("users.json", []);

  const resetIndex = resets.findIndex(
    (r) => r.token === parseResult.data.token && r.status === "pending"
  );

  if (resetIndex === -1) {
    return res.status(400).json({ message: "Reset token is invalid or already used" });
  }

  const reset = resets[resetIndex];
  const userIndex = users.findIndex((u) => u.id === reset.userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: "Account for this token was not found" });
  }

  users[userIndex].passwordHash = await bcrypt.hash(parseResult.data.newPassword, 12);
  users[userIndex].updatedAt = nowIso();

  resets[resetIndex].status = "used";
  resets[resetIndex].usedAt = nowIso();

  await writeJson("users.json", users);
  await writeJson("passwordResets.json", resets);

  return res.json({ message: "Password reset successful. You can now log in." });
});

router.post("/switch-role", requireAuth, async (req, res) => {
  const parseResult = switchRoleSchema.safeParse(req.body);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return res.status(400).json({ message: issue?.message || "Invalid role switch request" });
  }

  const users = await readJson("users.json", []);
  const currentIndex = users.findIndex((u) => u.id === req.user.id);
  if (currentIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const currentUser = users[currentIndex];
  if (currentUser.userType === parseResult.data.targetRole) {
    const token = signToken(currentUser);
    return res.json({ token, user: { ...currentUser, passwordHash: undefined } });
  }

  let targetAccount = users.find(
    (u) =>
      u.email.toLowerCase() === currentUser.email.toLowerCase() &&
      u.userType === parseResult.data.targetRole
  );

  if (!targetAccount) {
    const usernameBase = `${currentUser.username}_${parseResult.data.targetRole}`;
    let usernameCandidate = usernameBase;
    let counter = 1;
    while (users.some((u) => u.username.toLowerCase() === usernameCandidate.toLowerCase())) {
      usernameCandidate = `${usernameBase}${counter}`;
      counter += 1;
    }

    targetAccount = {
      ...currentUser,
      id: makeId("usr"),
      username: usernameCandidate,
      userType: parseResult.data.targetRole,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    users.push(targetAccount);
    await writeJson("users.json", users);
  }

  const token = signToken(targetAccount);
  return res.json({ token, user: { ...targetAccount, passwordHash: undefined } });
});

export default router;
