const router = require("express").Router();
const dotenv = require("dotenv");
// const { Resend } = require("resend");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verify")
const allowedRoles = require("../middlewares/permission");
const Task = require("../models/Task");

dotenv.config();

const email = process.env.EMAIL_USER;
// const resend = new Resend(process.env.RESEND_API_KEY)
const pwd = process.env.EMAIL_PASS;

router.get("/",(req,res)=>{
    res.send("User route is working");
})

router.post("/signup",async(req,res)=>{
    try {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password,salt)

        const user = await User.create({
            name:req.body.name,
            email:req.body.email,
            password:password,
            userType:req.body.userType
        })

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET);

         const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:email,
                pass:pwd
            },
        })

        let info = await transporter.sendMail({
            from:"Tech Info <nikhilacharikumta903@gmail.com>",
            to:req.body.email,
            subject:`Welcome,${req.body.name},verify your email - Tech Info`,
            html:`
            <div>
            <strong>${req.body.name}</strong>,we welcome to our platform.
            <a href="https://task-management26.netlify.app/verify/${token}">Verify Email</a>
                <div>
                    <p>Thanks and Regards</p>
                    <p>Tech Info Team</p>
                </div>
            </div>
            `,
        })
        console.log(info);
        if (error) {
            console.log(error);
            return res.json({ msg: "Signup succeeded but email failed to send", success: false });
        }
        console.log(data);
        res.json({ msg: "Signed up successfully", success: true });
    } catch (error) {
        if (error.code === 11000) {
            return res.json({ msg: "Email already registered", success: false });
        }
        res.json({ msg: error.message, success: false });
    }
})

router.get("/verify/:token",async(req,res)=>{
    try {
        const token = req.params.token;
        jwt.verify(token,process.env.JWT_SECRET,async(err,decoded)=>{
            if(err){
                return res.json({msg:"Invalid url"});
            }else{
                await User.findByIdAndUpdate(decoded.id,{verified:true})
                return res.json({msg:"Account verified",success:true})
            }
        })
    } catch (error) {
        res.json({msg:error.meassage})
    }
})

router.post("/login",async(req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email});
        if(user){
            if(user.verified){
                const result = await bcrypt.compare(req.body.password,user.password);            
            if(result){
                const token = jwt.sign({id:user._id, userType: user.userType},process.env.JWT_SECRET);
                return res.json({token,success:true,userType: user.userType})
            }else{
                return res.json({msg:"Wrong Password",success:false})
            }
        }else{
            return res.json({msg:"Please verify your account",success:false})
        }
    }else{
        return res.json({msg:"No user found",success:false})
    }   
    } catch (error){}
})

router.get("/data",verifyToken,async(req,res)=>{
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password -verified")
        if(user.userType === 3){
            const taskInfo = await Task.findOne({assignedTo:req.userId})
            res.json({user:{
                craetedAt:user.createdAt,
                name:user.name,
                email:user.email,
                updatedAt:user.updatedAt,
                userType:user.userType,
                id:user._id,    
                pId:taskInfo.project}},)
        }
        
        return res.json({user})
    } catch (error) {
        return res.json({msg:error.message})
    }
})

router.get("/managers",verifyToken,allowedRoles([1]),async(req,res)=>{
    try {
        const managers = await User.find({userType:2}).select("name email");
        return res.json({managers})
    } catch (error) {
        return res.json({msg:error.meassage})
    }
})

router.get("/members",verifyToken,allowedRoles([2]),async(req,res)=>{
    try {
        const members = await User.find({userType:3}).select("name email");
        return res.json({members})
    } catch (error) {
        return res.json({msg:error.meassage})
    }
})

// router.get("/status",verifyToken,allowedRoles([3]),async(req,res)=>{
//     try {
//         const status = await Task.find({assignedTo:req.userId}).select("status -_id")
//         return res.json({status})
//     } catch (error) {
//         return res.json({msg:error.meassage})
//     }
// })

module.exports = router;