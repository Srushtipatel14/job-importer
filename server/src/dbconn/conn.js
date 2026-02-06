const mongoose=require("mongoose")

const MongoConn=mongoose.connect(process.env.MONGO_URL)

module.exports=MongoConn