const mongoose = require("mongoose")
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2")

const commentSchema = new mongoose.Schema(
    {
      content:{
        type:String
      },
      owner:{
        type: mongoose.Schema.ObjectId,
        ref:"USer"
      }
    },
    {
        timeseries:true,
    }
)

commentSchema.plugin(mongooseAggregatePaginate)
export const Comment = mongoose.model("Comment", commentSchema)