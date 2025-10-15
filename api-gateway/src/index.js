require('dotenv').config();
const express = require('express')
const proxy =require('express-http-proxy')
const Redis =require('ioredis')
//const redisClient=require ('rate-limit-redis')
const {RedisStore}=require ('rate-limit-redis')
const {rateLimit}=require('express-rate-limit')
const Logger = require('./utils/Logger')
const helmet = require('helmet')
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')
const { ValidateToken } = require('./middleware/authMiddleware')
const PORT =process.env.PORT
const app =express();


//middlewares
app.use(helmet())
app.use(cors())
app.use(express());

app.use((req,res,next)=>{
    Logger.info(`Received   ${req.method} requested to ${req.url}`)
    Logger.info(`request body, ${req.body}`)
    next();
})

//redis connetion 
const redisClient = new Redis(process.env.REDIS_URL)


//rate limit 
const rateLimitOptions=rateLimit({
    windowMs:15*60*1000,
    max:100,
    standardHeaders:true,
    legacyHeaders:true,
    handler :(req,res)=>{
        Logger.warn(`sensiive endpoint rate limit exceeded for ip:${req.ip}`)
          res.status(429).json({
            sucess:false,
            message:'Too many requests'
        })
    },
    store:new RedisStore({
        sendCommand:(...args)=>redisClient.call(...args),
    })
})

app.use(rateLimitOptions);


const proxyOptions ={
    proxyReqPathResolver :(req)=>{
        return req.originalUrl.replace(/^\/v1/,'api')
    },
    proxyErrorHandler:(err,res,next)=>{
        Logger.error(`proxy error : ${err.message}`);
        res.status(500).json({
           message:`internal server error occured `,error: err.message
        })
    }
}
 //setting up proxy for our identity service
 app.use('/v1/auth',proxy(process.env.IDENTITY_SERVICE_URL,{
    ...proxyOptions,
    proxyReqBodyDecorator:(proxyReqOpts, srcReq)=>{
        proxyReqOpts.headers["Content-Type"]="application/json"
        return proxyReqOpts
    },
    userResDecorator:(proxyRes,proxyResData, userReq,userRes)=>{
        Logger.info(`Response received from identity service: ${proxyRes.statusCode}`)
        return proxyResData
    }
 }));

 //gateway for post service
 app.use('/v1/posts', ValidateToken,proxy(process.env.POST_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator : (proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers['content-Type'] ='application/json',
        proxyReqOpts.headers['x-user-id']= srcReq.user.userId
        return proxyReqOpts
    },
     userResDecorator:(proxyRes,proxyResData, userReq,userRes)=>{
        Logger.info(`Response received from post service: ${proxyRes.statusCode}`)
        return proxyResData
    }
 }))

  app.use('/v1/media',ValidateToken,proxy(process.env.MEDIA_SERVICE_URL,{
     ...proxyOptions,
     proxyReqBodyDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers['x-user-id']=srcReq.user.userId;
        if(!srcReq,headers['content-type'].startsWith('multipart/form-data')){
            proxyReqOpts.headers['content-type'] = application/json;
        }

        return proxyReqOpts;
     },
        userResDecorator:(proxyRes,proxyResData, userReq,userRes)=>{
        Logger.info(`Response received from media service: ${proxyRes.statusCode}`)
        return proxyResData

        },
        parseReqBody:false
  }))
app.use('/v1/search', ValidateToken,proxy(process.env.SEARCH_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator : (proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers['content-Type'] ='application/json',
        proxyReqOpts.headers['x-user-id']= srcReq.user.userId
        return proxyReqOpts
    },
     userResDecorator:(proxyRes,proxyResData, userReq,userRes)=>{
        Logger.info(`Response received from search service: ${proxyRes.statusCode}`)
        return proxyResData
    }
 }))
 //app.use(errorHandler())

 app.listen(PORT,()=>{
    Logger.info(`api gateway running on port ${PORT}`);
    Logger.info(`identity service is running on port: ${process.env.IDENTITY_SERVICE_URL}`)
    Logger.info(`redis is running on port :${process.env.REDIS_URL}`)
     Logger.info(`  post  service is running on port: ${process.env.POST_SERVICE_URL}`)
      Logger.info(`  media  service is running on port: ${process.env.MEDIA_SERVICE_URL}`)
       Logger.info(`  search  service is running on port: ${process.env.SEARCH_SERVICE_URL}`)
 })
































































