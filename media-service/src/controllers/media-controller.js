const Logger = require('../utils/Logger')


const uploadMedia=  asnyc(req,res)=>{
    Logger.info('uploading to cloudinary started')
    try{
        if(!req.file){
            Logger.error('No file found .please add file and try again')
            return res.status(400).json({
                sucess:false,
                message:"no file found . Please add file and try again "
            })
        }
        const {originalName , mimeType, buffer}=req.file();
        const userId = req.user.userId

        Logger.info(`File details: name=${originalName},type${mimeType}`)
        Logger,info('uploading to cloudinary started')

        const cloudinaryUploadResult =  await uploadMediaToCloudinary(req.file)
        Logger.info(`Cloudinary uploaded succesfully.public Id:-${cloudinaryUploadResult. public_id}`) 

        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            originalName,
            mimeType,
            url:cloudinaryUploadResult.secure_url,
            userId
        })

        await newlyCreatedMedia.save()
        res.status(201).json({
            sucess:true,
            mediaId: newlyCreatedMedia._id,
            url: newlyCreatedMedia.url.url,
            message:'Media uploaded succesfully'

        })
              
        

    }catch(error){
     Logger.error("Error creating post", error);
     res.status(500).json({
        sucess:false,
        message:'Error creating post'
     })
    }
}

module.exports = {uploadMedia }