const express=require('express')
const logger=require('../utils/Logger')
const{validationRegister} =require('../utils/validator')






  
const registerUser=async(req,res)=>{
    logger.info('Registration point hit....')
    try {
        const {error}=validationRegister(req.body)
        if(error){
            logger.warn('validation error occurred',error.details[0].message)
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }
          const{username, email, password}=req.body
          let user =  await User.findOne({$or:[{email},{password}]})
          if(user){
            logger.warn('user already exist',error.details[0].message)
            return res.status(400).json({
                sucess:false,
                message:error.details[0].message
            })
          }
            user = new User({username, password, email})
            await  user.save() 
            logger.warn('user saved successfullly', user._id)

     const {acessToken, refreshToken}=await generateToken(user)
       res.status(201).json({
        sucess:true,
        message:'account created successfully',
        accessToken,
        refreshToken
       })

    } catch (error) {
        logger.error('Registration error occurred')
        res.status(500).json({
            sucess:false,
            message:'internal server error occurred'
        })
    }
}

//login user

const loginUser=async( req, res)=>{
    logger.info('Login poin hit.......')

    try {
        const{error}=validatelogin(req.body)
        if(error){
           logger.warn('validation error occured',error.details[0].message)
           return res.status(500).json({
            sucess:false,
            message:'validation error occured ' ||error.details[0].message
           })
        }
        const {email,password}=req.body;

        const user =  user.findOne({email})
        if(!user){
            logger.warn('user does not exist')
            return res.status(400).json({
                success:false,
                message:'user does not exist'
            })
        }

        const isValidPassword=  user.comparePassword(password)
        if(!isValidPassword){
            logger.warn('invalid logins')
            return res.status(400).json({
                sucess:false,
                message:'invalid logins please try again '
            })
        }
    const {accessToken,refreshToken}= await generateToken(user)
    res.json({
        accessToken,
        refreshToken,
        userId : user._id
    })
        
    } catch (error) {
        logger.error('Registration error occurred')
        res.status(500).json({
            sucess:false,
            message:'internal server error occurred'
        })
   
    }
}

//refresh token
const refreshTokenUser = async (req,res)=>{
logger.info('Refresh token endpoint hit.....')
 
try {
    if(!refreshTokenUser){
    logger.warn('refresh token error occured')
    return res.status(400).json({
        success:false,
        message:'refresh token error occured'
    })
}
  
const storedToken = await RefreshToken.findOne({token:refreshToken})

if(!storedToken || storedToken.expiresAt <new Date ()){
    logger.warn('invalid or expired refesh token')
    return res.status(400).json({
        sucess:false,
        message:'refresh token expired '
    })
}

const user= await user.findById(Token.user)

if(!user){
    logger.warn('user does not exist')
     return res.status(401).json({
        success:false,
        message:'user not found'
     })
}

const {acessToken:newAccessToken , refreshToken: newRefreshToken}= await generateToken(user)
//delete the old token
await RefreshToken.deleteOne({id:storedToken._Id})
res.json({
    accessToken:newAccessToken,
    refreshToken:newRefreshToken
})

} catch (error) {
    logger.error('refresh token error occured ')
    res.status(500).json({
        success:false,
        message:'internal server error'
    })
    
}
}

//logout user
const logoutUser= async (req,res)=>{
    logger.info('logout endpoint hit.......')
    
    try {
        const {refreshToken}= req.body
        if(!refreshToken){
            logger.warn('refresh token is missing ')
            return res.status(400).json({
                sucess:false,
                message:'refresh token missing'
            })
        }
        await RefreshToken.deleteOne({token:refreshToken})
        logger.info('refresh token deleted for logout')
        res.json({
            sucess:true,
            message:'logged out successfully'
        })
        
    } catch (error) {
        logger.error('invalid or mising tokens')
        return res.status(500)
        .json({
            sucess:false,
            message:'internal server error'
        })
    }

}



module.exports={registerUser,loginUser,refreshTokenUser,logoutUser}














































































