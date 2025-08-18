/**
 * requireRoles("manager") o requireRoles("tutor")...
 * Acepta si el usuario tiene ALGUNO de los roles requeridos.
 */
function requireRoles(...need) {
  return (req,res,next)=>{
    const roles=(req.user&&req.user.roles)||{};
    const ok=need.some(r=>roles[r]===true);
    if (!ok) {return res.status(403).json({message:"Forbidden"});}
    return next();
  };
}

module.exports={requireRoles};
