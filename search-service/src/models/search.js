 const mongoose = require("mongoose");
 
 
 const searchPostSchema = new mongoose.Schema({
     postId:{
        type:String,
        unique:true,
        required:true 
     },
     userId:{
        type:String,
        unique:true,
        index:true
     },
     content:{
        type:String,
        unique:true,

     },
     createdAt:{
        type:Date,
        required:true,
        unique:true
     }
 },{timestamps:true});
searchPostSchema.index({content:'text'});
searchPostSchema.index({createdAt:-1});
const search = mongoose.model('search',searchPostSchema);


 module.exports=search;