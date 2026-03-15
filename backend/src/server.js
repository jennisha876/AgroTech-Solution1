import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import productsRoutes from "./routes/products.js";
import cropsRoutes from "./routes/crops.js";
import ordersRoutes from "./routes/orders.js";
import weatherRoutes from "./routes/weather.js";
import paymentsRoutes from "./routes/payments.js";
import aiRoutes from "./routes/ai.js";
import reviewsRoutes from "./routes/reviews.js";
import adminRoutes from "./routes/admin.js";
import trainingsRoutes from "./routes/trainings.js";
import { isAllowedFrontendOrigin } from "./utils/origins.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, "../../dist");

app.use(
  cors({
    credentials: true,
    origin(requestOrigin, callback) {
      if (isAllowedFrontendOrigin(requestOrigin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"));
    },
  })
);
app.use(express.json({ limit: "8mb" }));

app.get("/api/health", (_, res) => {
  res.json({ ok: true, service: "agrotech-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/crops", cropsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trainings", trainingsRoutes);

app.use(express.static(frontendDist));

app.get(/^\/(?!api).*/, (_, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

app.use((err, _, res, __) => {
  if (err?.message === "CORS not allowed") {
    return res.status(403).json({ message: "Origin not allowed" });
  }

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON request body" });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

app.use((_, res) => {
  res.status(404).json({ message: "Not found" });
});

const server = app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error?.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    if (process.env.NODE_ENV !== "production") {
      console.error("Another backend instance is already running; continuing in dev mode.");
      return;
    }
  }

  console.error(error);
  process.exit(1);
});
