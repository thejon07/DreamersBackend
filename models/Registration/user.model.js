const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema(
    {
         avatar:{
          type: String, // cloudinary url
         },
      username:{
        type:String,
        required:true,
        unique:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
        },
        password:{
            type:String,
            required:[true,"password must be at leas 6 characters long"]
        },
        refreshToken:{
            type:String
        },
        following:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
        followers:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
       
    },
    {timestamps:true}
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
     this.password = await bcrypt.hash(this.password,10)
     next() 
})   // please do not use arrow function. because arrow function does not support this keyword.

userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password,this.password) //this line return true or false
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
    {
        _id: this._id,
        email:this.email,
        username:this.username 
    },
    process.env.JWT_SECRET_KEY 
    ,
    {
        expiresIn:"120s"
    }
 )
}
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
        _id:this._id,
    },
    process.env.JWT_SECRET_KEY 
    ,
    {
        expiresIn:"10d"
    }
  )
}

 const User = mongoose.model("User",userSchema)  
 module.exports = User; 