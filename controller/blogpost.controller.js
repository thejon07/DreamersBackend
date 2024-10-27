const  asynchandler  = require("../utills/asynchandler")
const ApiEror = require("../utills/apiErrors")
const  blog = require("../models/Registration/blog.model")

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
    const {username,email,password} = req.body
    console.log(email)
    if([username,email,password].some((field)=>field?.trim() === "")){
      throw new ApiEror(400,"fullname is required")
    }
    const file =  req.files?.avatar[0]?.path;

})
 
module.exports = registerUser