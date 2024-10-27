const ApiEror = require("../utills/apiErrors");
const asynchandler = require("../utills/asynchandler");
const jwt = require("jsonwebtoken")
const User = require("../models/Registration/user.model")

const verifyJwt = asynchandler(async(req, _,next)=>{
try {
  const token = req.header("Authorization")?.replace(/^Bearer\s*/, "") || req.cookies?.accesstoken;
  if(!token){
    throw new ApiEror(401,"unauthorized access token")
  }
 
  const decodedtoken =  jwt.verify(token,"bijonmangang")
  const user =  await User.findById(decodedtoken?._id).select("-password -refreshtoken")
  console.log(user)
  if(!user){
   throw new ApiEror(401,"invalid access token")
  } 
  req.user = user;
  next()
} catch (error) {
  throw new ApiEror(401,"unauthorized request")
}
}
)

module.exports = verifyJwt 