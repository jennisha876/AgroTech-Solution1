import "dotenv/config";
import express from "express";
import cors from "cors";
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

const app = express();
const port = Number(process.env.PORT || 4000);
const origin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

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

app.use((_, res) => {
  res.status(404).json({ message: "Not found" });
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
