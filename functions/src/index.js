const functions=require("firebase-functions");
const admin=require("firebase-admin");
const express=require("express");
const cors=require("cors");

const {authMiddleware}=require("./middlewares/auth.middleware");
const {errorMiddleware}=require("./middlewares/error.middleware");

const sessionsRoutes=require("./api/sessions.routes");
const paymentsRoutes=require("./api/payments.routes");
const materialsRoutes=require("./api/materials.routes");
const usersRoutes=require("./api/users.routes");
const tutorsRoutes=require("./api/tutors.routes");

if (!admin.apps.length) {admin.initializeApp();}

const app=express();
app.use(cors({origin:true}));
app.use(express.json());

// Público
app.get("/health",(_req,res)=>res.json({ok:true}));

// Protegido
app.use(authMiddleware);

// Rutas de dominio
app.use("/sessions",sessionsRoutes);
app.use("/payments",paymentsRoutes);
app.use("/materials",materialsRoutes);
app.use("/users",usersRoutes);
app.use("/tutors",tutorsRoutes);

// Errores
app.use(errorMiddleware);

exports.api=functions.https.onRequest(app);
