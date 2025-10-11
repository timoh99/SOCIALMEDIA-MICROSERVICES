require('dotenv').config();
const express = require('express')
const helmet = require('helmet')
const Redis = require('ioredis')
const mongoose = require('mongoose')
const cors = require('cors')
const postRoutes= require('./routes/post-routes')
const errorHandler = require('./middleware/errorHandler')
const logger = require('./utils/Logger')
const ratelimit = require('express-rate-limit');
const { connectRabbitMQ } = require('./utils/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3002

//db connection
mongoose.connect(process.env.MONGO_URI).then(()=>
    logger.info('database connected successfully')).catch((e)=>
        logger.warn('database connection error:',error.message))
    




//redis client
const redisClient = new Redis(process.env.REDIS_URL);



//ip based rate limiting
 const ratelimiter =ratelimit({
    windowsMs :15*60*1000, //15 mins
    limit:100,
    standardheaders: true,
    legacyheaders:false,

    handler: (req,res)=>{
        logger.warn(`too many request for sensitive ip :${req.ip}`)
        res.status(429).json({
            sucess:false,
            message:'too many requests try again later'
        })
    }
 })

 //middlewares
 app.use(express())
 app.use(cors())
 app.use(helmet())

 app.use ((req, res)=>{
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
 })


//routes
app.use('/api/post',(req,res,next)=>{
    req.redisClient = redisClient
    next()
}, postRoutes)

app.use(errorHandler)

app.listen(PORT,()=>{
    logger.info(`server is up and running on port : ${PORT}`)
})

async function startserver(){
    try {
        await connectRabbitMQ();
         app.listen(PORT,()=>{
    logger.info(`server is up and running on port : ${PORT}`)
})
    } catch (error) {
       logger.error("Connection failed",error);
       process.exit(1); 
    }
   
}

startserver();





















 