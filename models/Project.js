const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true
        },
        manager:{
            type:mongoose.Types.ObjectId,
            ref:"users",
        },
        createdBy:{
            type:mongoose.Types.ObjectId,
            ref:"users",
        },
    },
    {timestamps:true}
)

const Project = mongoose.model("projects",ProjectSchema);

module.exports = Project;