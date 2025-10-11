


const HandlepostDeleted = async(event)=>{
    console.log(event,"eventeventevent");
     
     const{ postId,mediaIds}=event
try {
    const mediaToDelete = await media.find({id:{$in:mediaIds}})
      for(const  media of mediaToDelete){
        await deleteMediaFromCloudinary(media.publicId);
        await Media.findByIdAndDelete(mediaIds);
          
         logger.info(`Deleted media from ${media._Id} associated with this post id ${postId}`)
      }
 
      logger.info(`processed deletion for media from post id: ${postId}`)

} catch (error) {
    logger.error("Error occured while deleting media", error)
}
    }

module.exports={HandlepostDeleted};