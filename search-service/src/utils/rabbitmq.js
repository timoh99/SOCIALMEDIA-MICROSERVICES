 const amqp = require("amqp");
 const Logger = require ("./Logger");
const { useCallback } = require("react");



 let connection = null;
 let channel = null;

 const EXCHANGE_NAME = 'facebook-events';


 async function connectRabbitMQ(){
    try {
        connection = await  amqp.connect(process.env.RABBITMQ_URL);
        channel= await connection.createChannel();

        await channel.assertEXCHANGE(EXCHANGE_NAME,"topic",{durable:false});
        Logger.info("connected to rabbimq");
        return channel();
    } catch (error) {;

        Logger.error("failed connecting to L=Rabbitmq", error );
    }
 }

  
 async function consumeEvent(routinkey,message){
     if(!channel){
        await connectRabbitMQ();
          

     }
     const q =  await channel.assertQUEUE("",{exculsive:true});
     await channel.bindQueue(q.queue, EXCHANGE_NAME, routingkey)
     
     channel.consume(q.queue , (msg)=>{
      if(msg!==null){
const content = JSON.parse(msg.content.toString())
 callback(content)
 channel.ack(msg)
      }
     })
Logger.info(`Subscribed to event :${routingkey} `)
 }           








 module.exports= {connectRabbitMQ  , consumeEvent};