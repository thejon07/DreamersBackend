const User = require("../models/Registration/user.model");
const ApiEror = require("../utills/apiErrors");
const ApiResponse = require("../utills/apiResponse");
const asynchandler = require("../utills/asynchandler");


const unfollow = asynchandler(async(req,res)=>{
    const currentuserId = req.body.id;
    const targeteduserId = req.params.id;

    const currentuser = await User.findById(currentuserId)
    const targetuser = await User.findById(targeteduserId)

    const currentuserindex = await targetuser.followers.indexOf(currentuserId) 
   if(currentuserindex !== -1){
     targetuser.followers.splice(currentuserindex, 1)
     await targetuser.save()
     return res.status(200).json(
        new ApiResponse(200, { data: targetuser.followers }, "Successfully unfollowed")
    );
   }

    return res.status(200).json(
     new ApiResponse(201,{data:filteredfollowers},"successfully updated")
    )
})


const getfollowing = asynchandler(async(req,res)=>{
    const currentuserId =  req.body.id
    console.log(currentuserId)
    const targeteduserId = req.params._id
    console.log(targeteduserId)

    if(!currentuserId){
        throw new ApiEror(404,"id not foundd")
    }

    if(currentuserId == targeteduserId){
            throw new ApiEror(404,
                "you can not follow yourself"
            )
    }
  
    const currentuser = await User.findById(currentuserId)
    const targeteduser = await User.findById(targeteduserId)

    if(currentuser.following.includes(targeteduserId)){
        return res.status(400).json({message:"user already following"})
    }
    currentuser.following.push(targeteduser)
    await currentuser.save()

    targeteduser.followers.push(currentuser)
    await targeteduser.save()


   return res.status(200).json(
    new ApiResponse(
    201,{followin:currentuser.following.length},"you successfully followed the user"
    ))

})



const getfollowers = asynchandler(async(req,res)=>{
try {
   const followers =  await User.findById(req.params._id)
   return res.status(200).json(
    new ApiResponse(200,{followers:followers.followers.length},"here is your followers")
   )
} catch (error) {
    return res.status(400).json(
        new ApiEror(404,"there is something wrong with your request")
    )
}

})

module.exports = {getfollowing,getfollowers,unfollow};