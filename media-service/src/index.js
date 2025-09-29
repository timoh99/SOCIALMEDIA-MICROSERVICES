require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const {RedisStore} = require('rate-limit-redis')
const {ratelimit} = require('express-rate-limit');
const {mediaRoutes}= require('../routes/media-rotes.js');
const Logger= require('../utils/Logger.js')
const {authenticatedRoutes}= require('../middleware/authMiddleware');
const errorHandler = require('../../identity-service/src/middlewares/errorHandler.js');

const app = express();
const PORT = process.env.PORT || 3003;

//db connection

mongoose.connect(process.env.MONGO_URI).then(()=>{
     Logger.info('Database connected succesfully')
     .catch((e)=>{
        Logger.error('database connection failed to connect')
     })
})

//middlewares 
app.use(cors());
app.use(helmet());

app.use(express.json())

app.use((req, res, next)=>{
    Logger.info(`Received ${req.method} request to ${req.url}`);
    Logger.info(`Request body, ${req.body}`);
    next();
})

//ip based ratelimiter 

const sesnsitiveEndpoints = ratelimit({
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
        sendCommand:(...args) => redisClient.call(args) ,
    }),
})

app.use('/api/media',mediaRoutes);
app.use(errorHandler);

app.listen(PORT,()=>{
    Logger.info(`media service is running on port ${PORT}`);
});

