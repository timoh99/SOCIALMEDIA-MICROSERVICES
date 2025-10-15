 require('dotenv').config();
 const express= require('express')
 const cors= require('cors');
const helmet = require('helmet');
const mongoose= require('mongoose');
const Redis = require('ioredis');
const Logger = require("./utils/Logger");
const errorHandler = require("./middleware/errorHandler");
const {consumeEvent , connectRabbitMQ}= require("./utils/rabbitmq")
const searchroutes= require("./routes/search-routes")
const {handlePostCreated , handlePostDeleted} = require("./eventsHandler/search-handler");


 const app = express();
  
 const PORT = process.env.PORT ||3004;

 app.use(helmet());
 app.use(cors());
 app.use(express.json());
 app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Received body, ${req.body}`)
    next();
})


 mongoose.connect(process.env.MONGO_URI)
 .then(()=>
    Logger.info("Database conneced succesfully"))
    .catch((error)=> Logger.error("Databse connection failed",error))
 
    const redisClient = new Redis (process.env.REDIS_URL);

app.use('/api/search',searchroutes)
app.use(errorHandler);

    async function startServer(){
    try {
        await connectRabbitMQ();
        //1subscribe to event // publish the event
await consumeEvent('post-created',handlePostCreated);
await consumeEvent('post-deleted',handlePostDeleted);

app.listen(PORT,()=>{
Logger.info(`search service is running at port : ${PORT}`);
})


    } catch (error) {
       Logger.error("failed connecting to server") 

    }
}
 startServer();
