/**
 * requireRoles("manager") o requireRoles("tutor")...
 * Acepta si el usuario tiene ALGUNO de los roles requeridos.
 */
function requireRoles(...need) {
  return (req,res,next)=>{
    const roles=(req.user&&req.user.roles)||{};
    const ok=need.some(r=>roles[r]===true);
    
    // DEBUG: Log detallado de validación de roles
    console.log("🔒 Role Check:", {
      requiredRoles: need,
      userRoles: roles,
      hasAccess: ok,
      userUid: req.user?.uid
    });
    
    if (!ok) {
      console.error("❌ Forbidden: User lacks required roles");
      return res.status(403).json({message:"Forbidden"});
    }
    return next();
  };
}

module.exports={requireRoles};
