//file for authentication
const User = require("../model/User");
const bcrypt = require("bcryptjs")

//jwt
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const maxAge = 3*60*60; //max age of jwt token in secs (3hrs)

//valid pwd formatting (from lra frontend tutorial yt vid)
const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

//async function which takes user's data and registers it in database
exports.register = async(req,res,next) => {
    const {username, password} = req.body;

    if(!USER_REGEX.test(username)){
        return res.status(400).json({message: "Username doesn't follow correct regex"});
    }

    if(!PWD_REGEX.test(password)){
        return res.status(400).json({message: "Password doesn't follow correct regex"})
    }

    bcrypt.hash(password,10).then(async (hash) => {
        await User.create({
            username,
            password: hash,
        })
        .then(async(user) =>{
            //create token
            const maxAge =10 ;//3*60*60;
            const accessToken= jwt.sign(
                {id:user._id, username, coins:user.coins},
                jwtSecret,
                {expiresIn: maxAge}, //in secs
            );

            const refreshToken = jwt.sign(
                {"username": user.username},
                jwtSecret,
                {expiresIn: '1d'} //24 hrs;
            );

            //saving refreshToken w/ current user:
            user.refreshToken = refreshToken;
            const result = await user.save();

            //send refresh token as cookie to client
            res.cookie('jwt', refreshToken, { httpOnly: true, secure: true,  maxAge: 24 * 60 * 60 * 1000 });

            res.status(201).json({
                message: "Login successful",
                _id: user._id,
                coins:user.coins,
                accessToken
            });
        })
        .catch((error) =>{
            //if duplicate key error (same username)
            if(error.code === 11000){
                res.status(409).json({
                    message:"Username already taken",
                    error:error.message,
                });
                return;
            }

            //else
            res.status(400).json({
                message: "User not successfully created",
                error: error.message,
            })
        });
    });
    
}


//login function (also generating token for logged in users):
exports.login = async(req,res,next) =>{
    const {username,password} = req.body;

    //check if username and password provided:
    if (!username || !password){
        return res.status(400).json({
            message: "Username or Password not present",
        })
    }

    //attempt to find user w/ provided username and password
    try{
        const user = await User.findOne({ username});
        if(!user){ //no match
            res.status(401).json({
                message:"Login not successful",
                error: "User not found",
            })
        } else {//username match
            
            bcrypt.compare(password, user.password).then(async (result) => {
                if(result){
                    //create token
                    const maxAge =10 ;//3*60*60;
                    const accessToken= jwt.sign(
                        {id:user._id, username, coins:user.coins},
                        jwtSecret,
                        {expiresIn: maxAge}, //in secs
                    );

                    const refreshToken = jwt.sign(
                        {"username": user.username},
                        jwtSecret,
                        {expiresIn: '1d'} //24 hrs;
                    );

                    //saving refreshToken w/ current user:
                    user.refreshToken = refreshToken;
                    const result = await user.save();

                    //send refresh token as cookie to client
                    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true,  maxAge: 24 * 60 * 60 * 1000 });

                    res.status(201).json({
                        message: "Login successful",
                        _id: user._id,
                        coins:user.coins,
                        accessToken
                    });
                } else {
                    res.status(400).json({message: "Login not successful", error:"Incorrect Password"});
                }
            });
        }
    } catch(err){
        res.status(400).json({
            message:"An error occured",
            error: err.message,
        })
    }
}


exports.logout = async(req,res) =>{ //removes refresh token
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204) //no content
    const refreshToken = cookies.jwt;

    //is refreshtoken in db?
    const foundUser = await User.findOne({refreshToken}).exec();
    if(!foundUser){
        //if no match, clear cookie anyways (redundancy?)
        res.clearCookie('jwt', {httpOnly:true, sameSite: 'None', secure: true});
        return res.sendStatus(204);
    }

    //delete refreshToken in db
    foundUser.refreshToken = '';
    const result = await foundUser.save();
    console.log(result);

    res.clearCookie('jwt', { httpOnly: true, secure: true });
    res.sendStatus(204);
}

