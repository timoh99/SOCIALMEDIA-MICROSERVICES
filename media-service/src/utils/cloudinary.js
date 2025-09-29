const cloudinary =  require('cloudinary').v2;

const Logger = require('./Logger');

cloudinary.config({
    cloud_name:'process.env.cloud_name',
    api_key:'process.env.api_key',
    api_secret:'process.env.api_secret',
});

const uploadMediaToCloudinary = (file)=>{
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resorce_type:"auto"
            },
            (error, result)=>{
                if(error){
                    logger.error('Error while upoading media to cloudinary', error)
                    reject(error)
                }else{
                    resolve(result)
                }
            }
        )
        uploadStream.end(file.buffer); 
    })
}

module.exports= {uploadMediaToCloudinary};