import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "dev_secret";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.userType !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
}

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      userType: user.userType,
      location: user.location || "",
      phone: user.phone || "",
    },
    jwtSecret,
    { expiresIn: "7d" }
  );
}
