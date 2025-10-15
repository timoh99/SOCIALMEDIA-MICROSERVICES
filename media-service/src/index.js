require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const{RateLimiterRedis} =require('rate-limiter-flexible')
const Redis =require('ioredis')
const {RedisStore} = require('rate-limit-redis')
const ratelimit = require('express-rate-limit');
const mediaRoutes= require('./routes/media-routes');
const Logger= require('./utils/Logger.js')

const errorHandler = require('../../identity-service/src/middlewares/errorHandler.js');
const { connectRabbitMQ, consumeEvent } = require('./utils/rabbitmq.js');

const app = express();
const PORT = process.env.PORT || 3003;

//db connection

mongoose.connect(process.env.MONGO_URI).then(()=>
    Logger.info('Database connected succesfuuly'))
.catch((error)=>Logger.error('Database connection failed ', error.message))
const redisClient = new Redis (process.env.REDIS_URL)
//middlewares 
app.use(cors());
app.use(helmet());

app.use(express.json())

app.use((req, res, next)=>{
    Logger.info(`Received ${req.method} request to ${req.url}`);
    Logger.info(`Request body, ${req.body}`);
    next();
})
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

//ip based ratelimiter 

const sensitiveEndpoints = ratelimit({
    windowMs:15*60*1000,
    Limit:100,
    standardHaders:true,
    legacyHeadrs:true,

    handler:(req,res)=>{
        Logger.warn(` media  endpoint hit `)
        res.status(429).json({
            status:false,
            message:'too many media requests send please re try again later'
        })
    },
    store:new RedisStore({
        sendCommand:(...args) => redisClient.call(...args) ,
    }),
})
app.use(sensitiveEndpoints);

app.use('/api/media',mediaRoutes);
app.use(errorHandler);

app.listen(PORT,()=>{
    Logger.info(`media service is running on port ${PORT}`);
});

async function startServer(){
  try {
     await connectRabbitMQ();

     await consumeEvent('post.deleted')

     app.listen(PORT,()=>{
        Logger.info(`Media service is running on port: ${PORT}`)
     })
  } catch (error) {
    Logger.info("errror failed connecting to server",error);
  }
}

startServer();