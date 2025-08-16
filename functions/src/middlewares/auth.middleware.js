const admin = require("firebase-admin");

async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({error: "Unauthorized"});
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, role: decoded.role || decoded.claims?.role };
    next();
  } catch (e) {
    return res.status(401).json({error: "Invalid token"});
  }
}

module.exports = { authMiddleware };
