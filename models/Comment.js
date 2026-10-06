const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
    {
        task:{
            type:mongoose.Types.ObjectId,
            ref:"tasks",
        },
        text:String,
        user:{
            type:mongoose.Types.ObjectId,
            ref:"users",
        },
    },
    {timestamps:true}
)

const Comment = mongoose.model("comments",CommentSchema);

module.exports = Comment