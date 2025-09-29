const logger = require("../utils/Logger");
const jwt = require('jsonwebtoken')





const ValidateToken = (req,res,next)=>{
    const authHeader= req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1] 

    if(!token){
        logger.warn('Access denied')
        res.status(401).json({
            sucess:false,
            message:'Authenticsation failed '
        })
    }


jwt.verify(token, process.env.JWT_SECRET,(err, user)=>{
    if(err){
        logger.warn('invalid token')
        return res.status(429).json({
            success:false,
            message:'invalid token '
        })
    }
    req.user = user;
    next()
})
}
module.exports= {ValidateToken}