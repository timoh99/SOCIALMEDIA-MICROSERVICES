const  search  = require("../routes/search-routes")
const Logger = require("../utils/Logger");




async function handlePostCreated(event){
    try {
        const newSearchPost = new search({
            postId : event.postId,
            userId :event.userId,
            content:event.content,
            createdAt: event.createdAt
        })
         await newSearchPost.save();
         Logger.info(`search post created ${event.postId}, ${newSearchPost._id.toString()}`)
    } catch (error) {
        Logger.error(e, "Error handling post creaation event")
    }
}

async function handlePostDeleted(event){
    try {
         await search.findOneAndDelete({postId : event.postId});
         Logger.info(
           `search post created ${event.postId}, ${newSearchPost._id.toString()}`
         )
        
    } catch (error) {
        Logger.error("errror deleting post event", error);
    }
}



module.exports = {handlePostCreated , handlePostDeleted}