const express = require ('express');
const multer= require('multer');

const {uploadMedia, getAllMedia}= require('../controllers/media-controller.js');
const{authenticatedRequest}=require('../middleware/authMiddleware.js');
const Logger = require("../utils/Logger.js")

const router = express.Router();

//configuring multer for file upload
 
const upload = multer({
    storage: multer.memoryStorage(),
    limits:{
        fileSize:5*1024*1024
    }
}).single('file')

router.post('/upload',authenticatedRequest,(req,res,next)=>{
    upload(req,res,function(err){
        if(err instanceof multer.MulterError){
            Logger.error('Multer error while uploading :', error)
            return res.status(400).json({
                message:'Multer error while uploading',
                error:error.message,
                stack:err.stack
            })

        } else if(error){
            Logger.error('unkown error occured while uploading. please try again later: ',error)
            return res.status(500).json({
                message:'unkown error occured please try agin later',
                error: error.message,
                stack:err.stack
            })
        }
           if(!req.file){
            Logger.error("No file found")
            return res.status(400).json({
                message:'No file found'
            })
           }
           next();
    })
},uploadMedia)
router.get("/get", authenticatedRequest, getAllMedia);

module.exports= router;
