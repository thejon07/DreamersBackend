const Post = require("../models/Registration/post.model");
const User = require("../models/Registration/user.model");
const ApiEror = require("../utills/apiErrors");
const asynchandler = require("../utills/asynchandler");

const hitlike = asynchandler(async(req,res)=>{
    try {
    const targetUserPost = req.params._id;
    const currentUser = req.body._id;

    if(!currentUser || !targetUserPost){
        throw new ApiEror(400,"userid not found")
    }

   
    const isTargetuser  = await Post.findById(targetUserPost)
    const iscurrentuser  = await User.findById(currentUser)
    
    isTargetuser.likes.push(iscurrentuser)
    await Post.save()
    } catch (error) {
        throw new ApiEror(400,"error hit like")
    }

})

const asyncHandler = require('express-async-handler');
const ApiError = require('./path-to-ApiError'); // Ensure you have a custom error handling class defined
const Post = require('./models/Post'); // Import your Post model

const comments = asyncHandler(async (req, res) => {
  const { comment, userId, postId } = req.body;

  // Check if all necessary fields are provided
  if (!comment || !userId || !postId) {
    throw new ApiError(400, 'Comment, userId, and postId are required.');
  }

  // Find the specific post by postId
  const post = await Post.findById(postId);

  // Check if post exists
  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  // Add comment to the post's comments array
  post.comments.push({ user: userId, text: comment });

  // Save the updated post
  await post.save();

  res.status(201).json({
    success: true,
    message: 'Comment added successfully!',
    post,
  });
});

module.exports = comments;


module.exports = hitlike