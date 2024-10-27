const Post = require("../models/Registration/post.model");
const User = require("../models/Registration/user.model");
const ApiEror = require("../utills/apiErrors");
const ApiResponse = require("../utills/apiResponse");
const asynchandler = require("../utills/asynchandler");
const uploadOnCloudinary = require("../utills/cloudinary");

const savepost = asynchandler(async (req, res) => {
   try {
     const userid = req.params.userid;
 
     // Find the user by ID
     const user = await User.findById(userid);
     if (!user) {
       return res.status(404).json({ message: "User not found" }); // Handle case if user is not found
     }
 
     // Retrieve postdata from the request body
     const postdata = req.body;
 
     // Check if postdata exists
     if (!postdata || !postdata.content) {
       return res.status(400).json({ message: "No post data found" }); // Return if post data is missing
     }
 
        const avatarlocalpath = await req.file?.path
        if(!avatarlocalpath){
          return res.status(404,"missing avatar path")
        }
       
     const avatar = await uploadOnCloudinary(avatarlocalpath)
     if(!avatar){
      throw new ApiEror(400,"avatar not available")
    }
   

     // Create a new Post instance
     const datawillsave = new Post({
       title: postdata.title,
       category:postdata.tag,
       file: avatar.url,
       content: postdata.content,
       creator: user._id,
     });
 
     // Save the post instance to the database
     await datawillsave.save();
 
     // Return a response with the saved post data and a success message
     return res.status(201).json(
       new ApiResponse( // Ensure ApiResponse is defined correctly
         201,
         { data: datawillsave.content },
         "success"
       )
     );
 
   } catch (error) {
     console.error(error); // Log the error for debugging
     return res.status(400).json({ message: "Error creating the post" }); // Send a response on error
   }
 });

 const readblog = asynchandler(async(req,res)=>{
    const postid = req.params.postid;
    const post = await Post.findById(postid).populate("creator","username")
    return res.status(200).json(
      new ApiResponse(201,{data: post},"post successfully fetched")
    )
 })

 const allpost = asynchandler(async(req,res)=>{
  const allpost = await Post.find({})
  if(!allpost){
    throw new ApiEror(400,"missing post")
  }
  return res.status(200).json(
    new ApiResponse(201,{data:allpost},"successfully fetched all post from server")
  )
})
 
const getuserpost = asynchandler(async(req,res)=>{

  try {
    
  const userid = req.params.userid
  const posts = await Post.find({creator:userid}).populate("creator","username email").exec()
  
  res.status(200).json({
    success: true,
    message: `Posts retrieved for user: ${userid}`,
    posts,
  }) 
    
  } catch (error) {
    console.error(error)
  }


})

 const getFollowedUsersPosts = asynchandler(async (req, res) => {
   const userid = req.params.userid;
   
   // Check if userid is provided
   if (!userid) {
     return res.status(404).json({ message: "User ID not found" }); // Return error if no user ID is provided
   }
   
   // Find the user and populate the following array
   const user = await User.findById(userid).populate("following", "username");
   console.log(user)
   
   // Check if user exists
   if (!user) {
     return res.status(404).json({ message: "User not found" }); // Handle case if user is not found
   }
   
   console.log(user);        
   
   // Extract the IDs of the users that the current user is following
   const followingIds = user.following.map(followedUser => followedUser._id);
 
   // Find posts by creators in the following array
   const posts = await Post.find({ creator: { $in: followingIds } })
     .populate("creator", "username") // Populate creator field
     .sort({ createdAt: -1 }); // Sort by latest posts
 
   // Return the posts with a success response
   return res.status(200).json(
     new ApiResponse(200, { data: posts }, "Here are your posts") // Use 200 for the response status
   );
 });
 


// const getFollowedUsersPosts = asynchandler(async(req,res)) => {
//     try {
//       // Find the user by ID and populate the following field
//       const user = await User.findById(userId).populate("following", "username");

//       if (!user) throw new Error("User not found");

//       // Find posts where the creator is in the user's following list
//       const posts = await Post.find({ creator: { $in: user.following } })
//         .populate("creator", "username")
//         .sort({ createdAt: -1 }); // Sort by latest posts

//       return posts;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   };

module.exports = { getFollowedUsersPosts, savepost,getuserpost,allpost,readblog };