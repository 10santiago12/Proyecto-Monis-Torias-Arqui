require("./firebase");

// 👇 usa la API v2
const { onRequest } = require("firebase-functions/v2/https");

const express = require("express");
const cors = require("cors");
const { authMiddleware } = require("./middlewares/auth.middleware");
const { errorMiddleware } = require("./middlewares/error.middleware");
const sessionsRoutes = require("./api/sessions.routes");
const paymentsRoutes = require("./api/payments.routes");
const materialsRoutes = require("./api/materials.routes");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use(authMiddleware);
app.use("/sessions", sessionsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/materials", materialsRoutes);
app.use(errorMiddleware);

// 👇 región se pasa como opción
exports.api = onRequest({ region: "us-central1" }, app);
