const logger= require('../utils/Logger')



const errorHandler=(err,req,res,next)=>{
    logger.err(err.stack)

    res.status(err.status||500).json({
        message:err.message||'internal server error'
    })
}



module.exports=errorHandler;