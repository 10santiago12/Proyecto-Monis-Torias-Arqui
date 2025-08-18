const admin=require("firebase-admin");

/**
 * Verifica ID token y adjunta roles.
 * Roles vienen de custom claims; si no, cae a Firestore user_roles.
 */
async function authMiddleware(req,res,next) {
  try {
    const h=req.headers.authorization||"";
    const parts=h.split(" ");
    if (parts.length!==2||parts[0]!=="Bearer") {
      return res.status(401).json({message:"Missing bearer token"});
    }
    const idToken=parts[1];
    const decoded=await admin.auth().verifyIdToken(idToken);
    const roles=decoded.roles||await getRolesFromDb(decoded.uid);
    req.user={uid:decoded.uid,roles:roles||{}};
    return next();
  } catch (err) {
    return res.status(401).json({message:"Unauthorized"});
  }
}

async function getRolesFromDb(uid) {
  try {
    const snap=await admin.firestore().collection("user_roles").doc(uid).get();
    return snap.exists?snap.data():{};
  } catch (_) {
    return {};
  }
}

module.exports={authMiddleware};
