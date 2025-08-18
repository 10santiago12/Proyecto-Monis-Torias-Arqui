function errorMiddleware(err,_req,res,_next) {
  const status=err.statusCode||400;
  const message=err.message||"Error";
  return res.status(status).json({message});
}

module.exports={errorMiddleware};
