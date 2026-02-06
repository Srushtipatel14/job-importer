const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema({
    externalId: String,
    source: String,
    title: String,
    company: String,
    location: String,
    raw: Object
},{timestamps:true})

jobSchema.index({externalId:1,source:1},{unique:true});

module.exports=mongoose.model("job",jobSchema);