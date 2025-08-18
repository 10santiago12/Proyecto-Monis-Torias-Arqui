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

const API = "/api"; // base path

// ✅ Ruta pública
app.get(`${API}/health`, (_req, res) => res.json({ ok: true }));

// ✅ Middleware de autenticación para todas las rutas bajo /api/*
app.use(API, authMiddleware);

// ✅ Rutas de dominio bajo /api/...
app.use(`${API}/sessions`, sessionsRoutes);
app.use(`${API}/payments`, paymentsRoutes);
app.use(`${API}/materials`, materialsRoutes);
app.use(`${API}/users`, usersRoutes);
app.use(`${API}/tutors`, tutorsRoutes);

// ✅ Middleware de errores
app.use(errorMiddleware);

// ✅ Exportar como Cloud Function
exports.api = functions.https.onRequest(app);