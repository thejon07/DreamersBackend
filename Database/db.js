const mongoose = require("mongoose")

const connectDb = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI_1}`)
        console.log(`mongodb conneced db ${connectionInstance.connection.host}`)
      } catch (error) {
        console.log(error)
        process.exit(1)
      }
}


export default connectDb;