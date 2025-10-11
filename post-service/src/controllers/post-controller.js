const Logger= require('../utils/Logger')
const post = require('../models/post') 
const {}= require("../utils/rabbitmq");
const {validationcreatepost}= require('../utils/validator')


async function invalidatePostCache(req,input){
    const cachedkeys= `post:${input}`
    await req.redisClient.del(cachedkeys);
    const keys = await req.redisClient.keys("posts:*")
    if(keys.length>0){
        await req.redisClient.del(keys)
    }
}

const createPost = async (req,res) =>{
    Logger.info('createpost endpoint hit')
    try {
        const {error}=validationcreatepost(req.body)
        if(error){
            Logger.warn('validation error occurred',error.details[0].message)
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }
        const {content,mediaIds}= req.body
        const newcreatedPost =new post ({
            user:req.user.userId,
            content,
            mediaIds :mediaIds || []
        }) 
         await newcreatedPost.save();
         await invalidatePostCache(req, newcreatedPost._id.tostring())
         Logger.info("post created sucessfully",newcreatedPost)
         res.status(201).json({
            sucess:true,
            message:'Post created successfully'
         })
        
    } catch (error) {
        Logger.error("Error creating post")
        res.status(500).json({
            sucess:false,
            message:'error creating post'
        })
    }
}

 
const getallPost= async (req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page-1)*limit;

        const cachekey= `posts ${page}:${limit}`
        const cachedkeys = await req.redisClient.get(cachekey)
   
        if(cachedPosts){
            return res.json(JSON.parse(cachedPosts))
        }
        const posts = await post.find({}).sort({createdAt:-1}).skip(startindex).limit(limit)
        const totalNoOfPosts = await post.countDocument()
         const results= {
            page,
            currentpage,
            totalpages:Math.ceil(totalNoOfPosts/limit),
            totalposts:totalNoOfPosts

         }

         await req.redisClient.setex(cacchekey, 300 , JSON.stringify(results))
         res.json(results)

    } catch (error) {
      Logger.warn("Error getting all posts")  
      res.status(500).json({
        sucess:false,
        message:'Error grtting all posts'
      })
    }
}

const getPost = async (req,res) =>{
    try {
        const postId = req.params.id;
        const cachekey = `post:${postId}`
        const cachedPosts = await req.redisClient.get(cachekey);

        if(cachedPosts){
           return res.json(JSON.parse(cachedPosts))
        }
        const singlePostDetailsbyId= await Post.findById(postId)

        if(!singlePostDetailsbyId){
          return res.status(404).json({
            sucess:false,
            message:'post not found'
          })
        }
        await req.redisClient.setex(cachedPosts,3600,JSON.stringify(singlePostDetailsbyId))
        res.json(singlePostDetailsbyId)
        
    } catch (error) {
        Logger.error("Error getting  post by Id")
        res.status(500).json({
            sucess:false,
            message:'error getting post by Id'
        })
     
    }
}
const DeletePost = async (req,res) =>{
    logger.warn('delete post endpoint hit ')
    try {
        const post = await post.findOneAndDelete({
          _id: req.params.id,
          user: req.user.userId  
        })
        if(!post){
            return res.status(404).json({
                success:false,
                message:'post not found'
            })
        }

       await publishEvent(`post.deleted`,{
          postId: post._id.toString(),
          UserId : req.user.Userid,
          mediaIds:post.mediaIds



    })



        await invalidatePostCache(req, req.params.Id)
        res.json({
            message:'Post deleted succesfully'
        })
                
    } catch (error) {
        Logger.err("Error deleting post")
        res.status(500).json({
            sucess:false,
            message:'error deleting post post'
        })
    }
}
 module.exports ={ createPost, getallPost, getPost, DeletePost}