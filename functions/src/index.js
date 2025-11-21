const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const { authMiddleware } = require("./middlewares/auth.middleware");
const { errorMiddleware } = require("./middlewares/error.middleware");

const sessionsRoutes = require("./api/sessions.routes");
const paymentsRoutes = require("./api/payments.routes");
const materialsRoutes = require("./api/materials.routes");
const usersRoutes = require("./api/users.routes");
const tutorsRoutes = require("./api/tutors.routes");

// Inicializar Firebase Admin solo una vez
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Logging middleware para debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Ruta pública de health check (sin prefijo /api porque Firebase ya lo monta en /api)
app.get("/health", (_req, res) => {
  console.log("Health check called");
  return res.json({ ok: true });
});

// ✅ Rutas de dominio (sin prefijo /api porque Firebase ya lo monta en /api)
// Cada ruta maneja su propia autenticación internamente
app.use("/sessions", sessionsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/materials", materialsRoutes);
app.use("/users", usersRoutes);
app.use("/tutors", tutorsRoutes);

// ✅ Middleware de errores
app.use(errorMiddleware);

// ✅ Exportar como Cloud Function
exports.api = functions.https.onRequest(app);