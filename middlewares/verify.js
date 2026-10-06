const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

function verifyToken(req,res,next){
    const token = req.headers["authorization"];
    if(token){
        jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
            if(err){
                return res.json({msg:"Access denied"})
            }else{
                req.userId = decoded.id;
                req.userType = decoded.userType;
                next()
            }
        })
    }else{
        return res.json({msg:"Invalid request"})
    }
}

module.exports = verifyToken;