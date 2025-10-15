const mongoose = require('mongoose');

const postSchema =  new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    content:{
        type:String,
        required:true
    },
    mediaIds:[
        {
            type:String
        }
    ],
     createdAt:{
        type:Date,
        default:Date.now
     }



},{timestamp:true})

//db indexing
postSchema.index({content:'text'})

const Post =mongoose.model('Post',postSchema)