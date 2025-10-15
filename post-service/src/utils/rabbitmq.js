const amqp = require('amqplib');
const Logger = require('./Logger');

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events'
async function connectRabbitMQ(){
    try {
        connection  = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

 await channel.assertEXCHANGE(EXCHANGE_NAME,"topic",{durable:false});  
 Logger.info("connected to Rabbitmq");     
    } catch (error) {
       Logger.error("error failed connecting to rabbitmq", error); 
    }
}

async function publishEvent(routingkey, message){
    if(!channel){
        await connectRabbitMQ();
    }
    channel.publish(EXCHANGE_NAME, routingkey,Buffer.from(JSON.stringify(message)));
    Logger.info(`Event published ${routingkey} `);

}

module.exports= {connectRabbitMQ , publishEvent};