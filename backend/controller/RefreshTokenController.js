const User = require('../model/User');
const jwt = require('jsonwebtoken');

//for when requesting a new access token
const handleRefreshToken = async(req,res) =>{
    const cookies = req.cookies;

    if(!cookies?.jwt) return res.status(401).json({message: "No refresh token"})
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({refreshToken}).exec();
    if(!foundUser) return res.status(403).json({message: "Access forbidden"});

    //evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.JWT_SECRET,
        (err,decoded) =>{
            if(err || foundUser.username !== decoded.username) return res.status(403).json({message: "Access forbidden"});
            const maxAge = 10;
            const accessToken= jwt.sign(
                {id:foundUser._id, username: foundUser.username, coins:foundUser.coins},
                process.env.JWT_SECRET,
                {expiresIn: maxAge}, //in secs
                );

            res.json({accessToken, coins:foundUser.coins, user:foundUser.username})
        }
    );

}

module.exports = handleRefreshToken;