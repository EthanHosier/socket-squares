const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const User = require('../model/User')
const {getS3Object} = require('../controller/S3Controller');
const { disconnect } = require("mongoose");

const HEIGHT_IN_SQUARES = 11;

let images = new Array(HEIGHT_IN_SQUARES**2);


const startSocket = (server) =>{
    const io = require('socket.io')(server,{
        cors:{
            origin: ['https://admin.socket.io','http://localhost:3000']
        }
    })

    io.on('connection', socket =>{
        console.log(io.sockets.server.engine.clientsCount);
        
        socket.on("get-all-images",(cb)=>{
            //cb(getRandomImages());
            console.log(`get-all-images: ${socket.id}`)
            cb(images);
        })

        socket.on("end", ()=>{
            socket.disconnect(0);
            console.log("disconnect")
        })

        socket.on("buy", (index, price, accessToken, retryWithNewAT) =>{
            if(!(accessToken && (index >= 0 && index <= images.length && Number.isInteger(index)))){ //check for valid request (key has to be integer between 0 and HEIGHT_IN_SQUARES**2")
                socket.emit("exception", {errorMessage: 'Invalid request'});
                return;
            }           
            
            jwt.verify(accessToken, jwtSecret, async(err,decoded) =>{
                if(err){
                    console.log("err")   
                    retryWithNewAT(); //callback to retry
                    return new Error('Authentication Error')
                };

                //valid token; now check for valid user:
                let user = "";
                try{
                    user = await User.findById(decoded.id)
                }catch(err){
                    socket.emit("exception", {errorMessage: 'No user found'});
                    return;
                }

                //check has sufficient funds
                if(user.coins < price) {
                    socket.emit("exception", {errorMessage: 'Insufficient funds'});
                    return;
                }
                console.log("sufficient funds")

                //check user has set img url (so has img key)
                if(user.imgKey ===" "){
                    socket.emit("exception", {errorMessage: 'Invalid img key'});
                    return;
                } 

                const url = user.imgUrl;
                const axios = require("axios");
                try{
                
                    const object = await getS3Object(user.imgKey)
                    const raw = Buffer.from(object.Body).toString('base64');
                    const base64Image = "data:" + object.ContentType + ";base64, " + raw;
                    images[index] = base64Image;
                    io.emit(`update-image-${index}`,base64Image);
                    let userCoins = user.coins;
                    socket.emit('update-coins',userCoins - 1);
                    user.coins -=1;
                    await user.save();

                }catch(err){
                    console.log(err)
                    //socket.emit("exception", {errorMessage: err});
                }
                

            })

        })
    })
    
    io.on('disconnect', socket =>{
        console.log(io.sockets.server.engine.clientsCount);
    })



}


module.exports = startSocket;