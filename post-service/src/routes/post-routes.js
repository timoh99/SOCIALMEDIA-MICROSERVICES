const express = require('express')
const{createPost,getallPost, DeletePost, getPost}= require('../controllers/post-controller.js')
const { authenticatedRequest }= require('../middleware/authMiddleware')
 const router = express()

//middleware
router.use(authenticatedRequest)

router.post('/createPost', createPost)
router.get('/getallPost', getallPost)
router.get('/:id', getPost )
router.delete('/:id', DeletePost)

module.exports= router;