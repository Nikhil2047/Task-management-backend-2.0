const router = require("express").Router();

const verifyToken = require("../middlewares/verify");
const allowedRoles = require("../middlewares/permission");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Comment = require("../models/Comment");


router.get("/",(req,res)=>{
    res.send("Project route is working")
})

router.post("/create", verifyToken, allowedRoles([1]), async (req, res) => {
  try {
    const projectData = await Project.create({
      title: req.body.title,
      createdBy: req.userId,
    });
    res.json({ msg: "Project Created", pid: projectData._id, success: true });
  } catch (error) {
    res.json({ error });
  }
});


router.put("/assign/:pid",verifyToken,allowedRoles([1]),async(req,res)=>{
    try {
        await Project.findByIdAndUpdate(
            req.params.pid,
            {manager:req.body.mId},
            {new:true}
        )
        res.json({msg:"Manager is assigned",success:true})
    } catch (error) {
        res.json({error})
    }
})

router.get("/all",verifyToken,allowedRoles([1,2]),async(req,res)=>{
    try {
        let projects = [];
        if(req.userType === 1){
            projects = await Project.find({createdBy:req.userId});
        }else{
            projects = await Project.find({manager:req.userId})
        }
        return res.json({projects})
    } catch (error) {
        res.json({error})
    }
})



router.get("/task/all/:pid",verifyToken,allowedRoles([2,3]),async(req,res)=>{
    try {
        let tasks = [];
        if(req.userType === 2){
            tasks = await Task.find({project:req.params.pid});
        }else{
            tasks = await Task.find({assignedTo:req.userId})
        }
        return res.json({tasks})
    } catch (error) {
        res.json({error})
    }
})

router.post("/create-task",verifyToken,allowedRoles([2]),async(req,res)=>{
    try {
        const project = await Project.findOne({
            manager:req.userId,
            _id:req.body.pId
        });
        if(project){
            const task = await Task.create({
                project:project._id,
                name:req.body.name,
            })
            return res.json({
                msg:"Task Created",
                taskId:task._id,
                success:true,
            })
        }else{
            return res.json({msg:"Access Denied",success:false})
        }
    } catch (error) {
        res.json({error})
    }
})


router.put("/assign-task/:taskId",verifyToken,allowedRoles([2]),async(req,res)=>{
    try {
        await Task.findByIdAndUpdate(
            req.params.taskId,
            {assignedTo:req.body.memId},
            { new:true}
        )
        res.json({msg:"Task has been assigned",success:true})
    } catch (error) {
        res.json({error})
    }
})


router.put("/comment/:taskId",verifyToken,allowedRoles([3]),async(req,res)=>{
    try {
        const task = await Task.findOne({
            assignedTo:req.userId,
            _id:req.params.taskId,
        })

       await Comment.create({
            task:task._id,
            text:req.body.comment,
            user:req.userId,
        })
        res.json({msg:"Comment added",success:true})
    } catch (error) {
        res.json({error})
    }
})

router.get("/comment/all/:taskId",verifyToken,allowedRoles([3]),async(req,res)=>{
    try {
        let comment = [];
        comment = await Comment.find({task:req.params.taskId}).select("text")
        return res.json({comment})
    } catch (error) {
        res.json({error})
    }
})

router.put("/update-status/:taskId",verifyToken,allowedRoles([3]),async(req,res)=>{
    try {
        await Task.findOneAndUpdate(
            {
            assignedTo:req.userId,
            _id:req.params.taskId,
            },
            {status:req.body.status},
            {new:true}            
        )
        res.json({msg:"Task Status Updated",success:true})
    } catch (error) {
        res.json({error})
    }
})  


module.exports = router;


