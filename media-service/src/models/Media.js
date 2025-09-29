const mongoose = require('mongoose')

const mediaSchema = new mongoose.Schema({
    publicId:{
        type:String,
        required:true
    },
    originalName:{
        type:String,
        required:true
    },
    mimeType:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    UserId:{
        type:String,
        ref:"User",
        required:true
    }
},{timestamp:true})

const media = mongoose.model('media',mediaSchema);

module.exports= media;