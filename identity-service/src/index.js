require('dotenv').config()
const logger= require ('./utils/Logger')
const express= require('express')
const mongoose=require('mongoose')
const helmet =require('helmet')
const cors =require('cors')
const{RateLimiterRedis} =require('rate-limiter-flexible')
const Redis =require('ioredis')
const ratelimit=require('express-rate-limit')
const {RedisStore}=require('rate-limit-redis')
const routes = require('./routes/identity-service')
//const { Console } = require('winston/lib/winston/transports')
const errorHandler = require("./middlewares/errorHandler");
const app =express()
const PORT =process.env.PORT


//database connection 
mongoose.connect(process.env.MONGO_URI)
.then(()=>logger.inf0('database connected successfully '))
.catch((e)=>logger.error('database connection error:',error.message))

//redis 
const redisClient = new Redis (process.env.REDIS_URL)

//middleware
app.use(cors())
app.use(helmet());
app.use(express.json())
app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Received body, ${req.body}`)
    next();
})
//ddos protection 
const ratelimiter = new RateLimiterRedis({
    storeClient:redisClient,
    keyPrefix:'middleware',
    points:10,
    duration:1
 })

app.use((req,res,next)=>{
    ratelimiter.consume(req.ip)
    .then(()=>next())
    .catch(()=>{
        logger.warn(`Rate limit excededd for this ip: ${req.ip}`);

        res.status(429).json({
            sucess:false,
            message:'Too many requests'})
    })
})
//ip based rate limiter for sensitive endpoints
const sensitiveEnpointsLimiter=ratelimit({
    windows:15*60*100000,
    max:50,
    standardHeaders:true,
    legacyheasers:true,
    handler :(req,res)=>{
        logger.warn(`sensiive endpoint rate limit exceeded for ip:${req.ip}`)
          res.status(429).json({
            sucess:false,
            message:'Too many requests'
        })
    },
    store:new RedisStore({
        sendCommand:(...args)=>redisClient.call(...args),
    })
})
//use in all endpoints
app.use('/api/auth/register',sensitiveEnpointsLimiter)

app.use('/api/auth', routes)

app.use(errorHandler)




//server connection 
app.listen(process.env.PORT, ()=>{
    logger.info(`server is listeningg on PORT ${PORT}`)
})

process.on('unhandledRejection',(reason,promise)=>{
    logger.info('unhandle rejection at ', promise, "reason:",reason )
})