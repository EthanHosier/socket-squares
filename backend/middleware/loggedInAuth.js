require("dotenv").config();

const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

//simply check for access token
exports.loggedInAuth = (req,res,next) =>{
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1]; 

    jwt.verify(token,jwtSecret, (err,decodedToken) => {
        if(err){
            return res.status(403).json({message: "Not authorized"});
        }
        else{
            //authorised
            req.username = decodedToken.username;
            req._id = decodedToken.id;
            next();
        }
    })
}