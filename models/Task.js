const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
    {
        project:{
            type:mongoose.Types.ObjectId,
            ref:"projects",
            required:true,
        },
        name:{
            type:String,
            required:true,
        },
        assignedTo:{
            type:mongoose.Types.ObjectId,
            ref:"users",
        },
        status:{
            type:Number,
            default:1,
        },
    },
    {timestamps:true}
)

const Task = mongoose.model("tasks",TaskSchema);

module.exports = Task;