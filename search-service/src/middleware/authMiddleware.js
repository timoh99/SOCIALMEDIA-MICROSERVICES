const Logger = require('../utils/Logger')


const authenticatedRequest =(req,res,next)=>{
    const userId = req.headers['x-user-id']

    if(!userId){
        Logger.warn('Access attempted without login id')
        return res.status(401).json({
            sucess:false,
            message:'Authentication required please login to continue'
        })
    }
    req.user ={userId}
    next()
}

module.exports={authenticatedRequest}