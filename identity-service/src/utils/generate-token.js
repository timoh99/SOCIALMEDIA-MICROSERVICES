const jwt =require('jsonwebtoken')
const crypto= require('crypto ')


const generateToken = async(user)=>{
    const accessToken =jwt.sign({
        userid:user._id,
        username:user.username
    },PROCESS.ENV.JWT_SECRET,{expiresIn:'60m'})

const RefreshToken =crypto.getRandomBytes(40).toString('hex');
 const expiresAt =new Date();
 expiresAt.setDate(expiresAt.getDate()+7) //token expires in seven dyas

await RefreshToken.create({
    token:RefreshToken,
    user:user._id,
    expiresAt
})
return {accessToken,refreshToken}

}

 module.export = generateToken