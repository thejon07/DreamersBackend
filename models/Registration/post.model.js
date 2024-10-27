const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    file:{
     type:String,
     required:true
    },
    category:{
      type:String,
      required:true
    },
    title:{
     type:String,
     required:true
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user references who liked the post
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User reference
        text: { type: String, required: true }, // Text content of the comment
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
