 const amqp = require("amqplib");
 const Logger = require ("./Logger");




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


 async function publishEvent (routingkey ,message){
    if(!channel){
        await connectRabbitMQ();
    }

    channel.publish(EXCHANGE_NAME , routingkey, Buffer.from(JSON.stringify(message))),
                Logger.info(`Event published on ${routingkey}`)
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








 module.exports= {connectRabbitMQ ,publishEvent , consumeEvent};