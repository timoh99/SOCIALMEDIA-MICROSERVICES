
const Logger = require("./utils/Logger")
const{searchroutes}= require("../routes/search-routes")
const {errorHandler} =require("../middleware/errorHandler");
const { connectRabbitMQ } = require("../../../post-service/src/utils/rabbitmq");
const handlePostCreated = require("../errorHandler/search-handler");

const searchPostController = async(req,res)=>{
    Logger.info("search post endpoint hit");
    try {
        const {query} = req.query;
         const results = await search.find({
$text :{$search:query}
         },
        {
            $score:{$meta:"textScore"}
        }).sort({score:{$meta:"textScore"}}).limit(10);
        res.json(results)
    } catch (error) {
        Logger.error("Error searching the post", error)
        res.status(500).json({
            status:false,
            message:"error while seaching for Post"
        })
    }

}
;










Module.exports ={searchPostController}