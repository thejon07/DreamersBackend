const  asynchandler  = require("../utills/asynchandler")
const ApiEror = require("../utills/apiErrors")
const User = require("../models/Registration/user.model")
const uploadOnCloudinary = require("../utills/cloudinary")
const ApiResponse = require('../utills/apiResponse')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require("mongoose")
const { status } = require("express/lib/response")
const Post = require("../models/Registration/post.model")




const generateAccessTokenandRefreshToken = async (userid)=>{
    try {

      //we should keep refresh token in server

      const user = await User.findById(userid)
      const accesstoken =  user.generateAccessToken();
      const refreshtoken = user.generateRefreshToken();

      user.refreshToken = refreshtoken; // thise line addd refreshtoken property and const refreshtoken's value to the user object
      await user.save({validateBeforeSave:false});  // when you save user object to the database the user model what we are write using schema we add many fields that are required.so this code basicaly remove validation from model.
      return {accesstoken,refreshtoken} //after saving the refresh token to the database we should return both of them in response
    } catch (error) {
      throw new ApiEror(500,"something went wrong while generating tokens")
    } 
}

const registerUser = asynchandler(async (req,res)=>{
    //get user details from frontend
    //validation - not empty
    //check if uesr is already exist : username,email
    //check avatar
    //upload them to cloudinary 
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res
    console.log(req.body)
    const {username,email,password} = req.body;
    console.log(email)
    if([username,email,password].some((field)=>field?.trim() === "")){
      throw new ApiEror(400,"username is required")
    }
   
    const existinguser = await User.findOne({
      $or: [{username},{email}] //check the value
    })
    if(existinguser){
        throw new ApiEror(409,"this user already exists")
    }

    const avatarlocalpath =  req.file?.path;
    console.log(avatarlocalpath)
    
    if(!avatarlocalpath){
      throw new ApiEror(409,"please upload a new new avatar")
    }
    const avatar = await uploadOnCloudinary(avatarlocalpath)
    if(!avatar){
      throw new ApiEror(400,"avatar not available")
    }
     

    const user =  await User.create({       //userSChema is used for creating the user
      username: username,
      avatar:avatar.url,
      email:email,
      password:password
    })

     
    const jwttoken =  user.generateAccessToken()
    console.log(jwttoken)

    const refreshtoken = user.generateRefreshToken()
    console.log(refreshtoken)

   const isUserCreated = await User.findById( user._id).select(
    "-password -refreshToken" // minus - before the string is for filter out fields from an object
   )

   if(!isUserCreated){
    throw new ApiEror(500,"there's an eerror in server")
   }
   
   return res.status(201).json(
    new ApiResponse(200,{isloggedin:"true",userdata:isUserCreated, refreshToken:refreshtoken, accesstoken:jwttoken,name:user.username,email:user.email},"user created successfully")
   )
})

const getallusers = asynchandler(async(req,res)=>{
  const users = await User.find({})
  if(users.length === 0){
      res.status(404)
  }
  return res.status(200).json(
      new ApiResponse(201,{
          allusers:users
      },
  "heres all your users"
)
  )
})



const loginUser = asynchandler(async(req,res)=>{
  //username || email, password from req.body
  //find the user
  //password check
  //access token and refresh token
  //send cookie
  const {email,username,password} = req.body;

  if(!username && !email){
    throw new ApiEror(400,"username or password is required")
  }
  
 const user =  await User.findOne({
    $or: [{username},{email}]       //mongodb operator
  }) //findone method return first user entity
   
if(!user){
  throw new ApiEror(404,"user not found")
}

const ispassworvalid =  await user.isPasswordCorrect(password)
if(!ispassworvalid){
  throw new ApiEror(401,"invalid user credentials")
}

const {accesstoken,refreshtoken}= await generateAccessTokenandRefreshToken(user._id)
if(!refreshtoken || !accesstoken){
  throw new ApiEror(401,"invalid refresh token")
}

const loggedinuser = await User.findById(user._id).select("-password -refreshtoken")
const options = {
  httpOnly:true,
  secure:true
}

return res.status(200).cookie("accestoken",accesstoken,options).cookie("refreshtoken",refreshtoken,options).json(
  new ApiResponse(200,{
    user:loggedinuser,
    accesstoken:accesstoken,
    refreshtoken:refreshtoken,
    isloggedin:"true"
  },
  "user logged in successfully"
)
)
}) 

const logoutUser = asynchandler(async(req,res)=>{
   User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
          refreshtoken:undefined
      }   // which which field you want to update
    },
    {
      new:true  // it will response new updatet information about the user
    }
   )
   const options = {
    httpOnly:true,
    secure:true
  }
  return res.status(200).clearCookie("accessToken",options).clearCookie("refreshtoken",options)
  .json(200,{},"user log out successfully")
})
 
const getaccesstokenfromrefreshToken = asynchandler(async (req, res) => {
  const incomingrefreshtoken = req.body.refreshToken;
  console.log("Incoming Refresh Token:", incomingrefreshtoken);

  if (!incomingrefreshtoken) {
    throw new ApiEror(401, "Unauthorized request");
  }

  let decodedtoken = jwt.verify(incomingrefreshtoken, "bijonmangang");


  const user = await User.findById(decodedtoken?._id);
  console.log(user)
  if (!user) {
    throw new ApiEror(401, "Invalid refresh token");
  }

  console.log("Stored Refresh Token:", user?.refreshToken);

  // Trim both tokens to avoid any extra whitespaces
  if (incomingrefreshtoken.trim() !== user?.refreshToken.trim()) {
    throw new ApiEror(401, "Refresh token is expired or used");
  }

  try {
    const options = {
      httpOnly: true,
      secure: true
    };

    const { accesstoken,refreshtoken } = await generateAccessTokenandRefreshToken(user._id);

    // Update the new refresh token in the database
    // user.refreshToken = refreshtoken;
    await user.save(); // Save the new refresh token to the user in the DB
    
    return res
      .status(200)
      .cookie("accesstoken", accesstoken, options)
      .cookie("refreshtoken", refreshtoken, options)
      .json(
        new ApiResponse(
          200,
          { accesstoken: accesstoken, refreshtoken: refreshtoken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiEror(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = (asynchandler(async(req,res)=>{
  const {oldPassword,newPassword} = req.body
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new ApiEror(400,"invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res.status(200)
             .json(
              new ApiResponse(200,{},"Password change successfully")
             )
}))

const getCurrentUser = asynchandler(async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found." });
  }

return res.status(200).json(
  new ApiResponse(
    200,
    {userdata:req.user},
    "user fetched successfully"
  )
)

//   return res.status(200).json(
//     new ApiResponse(
//     status: 200,
//     {
//       user: req.user},
//   "Current User Fetched"
//   )
// });
})

const updateAccountDetails = asynchandler(async(req,res)=>{
  const {username,email} = req.body;
  if(!username || !email){
    throw new ApiEror(400,"all fields are required")
  }
  User.findById(req.user?._id,
    { 
      $set:{             //mongodb operator check this out
        username:username,
        email:email
      }
    },
    {new:true}  //return updated information 
  ).select("-password")
    return res
      .status(200)
      .json(
        new ApiResponse("200",user,"Account updated successfully")
      )

})

const updateUseravatar = asynchandler(async(req,res)=>{
  const avataelocalpath = req.file?.path
  if(!avataelocalpath){
    throw new ApiEror(400,"avatar file is missing")
  }
  const avatar = await uploadOnCloudinary(avataelocalpath)
  if(!avatar.url){
    throw new ApiEror(400,"error while uploading avatar")
  }
  const user = await User.findByIdAndDelete(
    req.user?._id,
    {
    $set:{
      avatar:avatar.url
    }
    },
    {new:true} //return updated document
  ).select("-password")

  return res.status(200).
  json(
    new ApiResponse(200,user,"avatar image updated successfully")
  )
})

const getUserChannelProfile = asynchandler(async(req,res)=>{

  const username = req.params
  if(!username?.trim()){
    throw new ApiEror(400,"username is missing")
  }

  const channel =  await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscriber"
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount:{
          $size:"$subscribers"
        },
        channelSubscribeToCount:{
          $size:"subscribeTo"
        },
        isSubscribed:{
          if:{$in:[req.user?._id,"$subscribers.subscriber"]},
          then:true,
          else:false
        }
      }
    },
    {
      $project:{
        username:1,
        subscribersCount:1,
        channel:1,
        avatar:1,
        email:1,
        channelSubscribeToCount:1
      }
    }
  ])

  if(!channel?.length){
    throw new ApiEror(404,"channel does not exist")
  }
  
  return res.status(200).json(
    new ApiResponse(200,channel[0],"user channel successfully fetched from server")
  )
  
})

const getWatchHistory = asynchandler(async(req,res)=>{
  const user = await User.aggregate[
    {
      $match:{
        // _id:req.user._id //inside aggregate mongoose will not work you have to create mongoose object
          _id: new mongoose.Types.ObjectId(req.user._id),
          
            }
          },
            {
              $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                  {
                    $lookup:{
                      from:"users",
                      localField:"owner",
                      foreignField:"_id",
                      as:"owner",
                      pipeline:[
                        {
                          $project:{
                            username:1,
                            avatar:1, 
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
  ]
  return res.status(200).json(
    new ApiResponse(200,user[0].watchHistory,"watch history fetched successffully")
  )
})

const getsearchdata = asynchandler(async (req, res) => {
  const posttitle = req.body.title;
  console.log(posttitle)
  if (!posttitle) {
      console.log("Error: Post title is missing");
      return res.status(400).json({ message: "Post title is required" });
  }

  try {
      // Use a regex pattern to match posts that contain the user's input in the title
      const allpost = await Post.find({ title: { $regex: posttitle, $options: 'i' } });
      console.log(allpost); // Confirm data in the console

      return res.status(200).json({
          status: 200,
          data: allpost,
          message: "Fetched data successfully",
      });
  } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ message: "Error fetching posts" });
  }
});



module.exports = {registerUser,loginUser,logoutUser,getCurrentUser,getallusers,getaccesstokenfromrefreshToken,getsearchdata}
// module.exports =  logoutUser
// module.exports =  refreshToken
// module.exports = updateAccountDetails
// module.exports = updateUseravatar
// module.exports = getCurrentUser
 