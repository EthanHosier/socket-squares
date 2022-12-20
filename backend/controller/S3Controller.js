const aws = require("aws-sdk");
const crypto = require('crypto');
const { isGeneratorObject } = require("util/types");

const User = require("../model/User");

require("dotenv").config();
const randomBytes = require("util").promisify(crypto.randomBytes)

const region = "eu-west-2"
const bucketName = "direct-upload-socket-squares-1"
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
 
const s3 = new aws.S3({
   region,
   accessKeyId,
   secretAccessKey,
   signatureVersion: 'v4'
})

//generatures upload url and deletes item at old url
exports.generateUploadUrl = async(req,res,next) =>{

   //DELETE PREVIOUS:
   const user = await User.findById(req._id)
   if(!user){ //no match
      return res.status(401).json({
          message:"URL not successfully updated",
          error: "User not found",
         })
   }

   const prevKey = user.imgKey;
   if(prevKey !== " "){
         const prevParams = {  Bucket: bucketName, Key: prevKey };
         const response = s3.deleteObject(prevParams, (err,data) =>{});
   }

   //GENERATE:
   const rawBytes = await randomBytes(16);
   const key = req.username+rawBytes.toString('hex');

   const params = ({
       Bucket: bucketName,
       Key: key,
       Expires: 60 //secs
   })
 
   try{
      const url = await s3.getSignedUrlPromise('putObject',params); //generate upload url
      res.send({url});
   }catch (err){
      return res.status(502).json({message: "AWS failed to respond"});
   }
      
}

exports.updateMongoUrl = async(req,res,next) =>{
   const url = req?.body?.data?.url
   if(!url) return res.status(400).json({message: "No url present in request"});
   
   const user = await User.findById(req._id)
   
   if(!user){ //no match
      return res.status(401).json({
          message:"Update unsuccessful",
          error: "User not found",
         })
   }

   user.imgKey= url.split('/')[3];
   user.coins -= 1;
   const result = await user.save();

   res.status(201).json({
      message: "Successfully updated url",
      coins: user.coins,
  });
}

exports.getS3Object = async(key)=>{
   
   const params = {
      Bucket: bucketName,
      Key: key
   }

   
   const object = await s3.getObject(params).promise();
   return object;
   /*
   let object;
   s3.getObject(params, (err,data)=>{
      if(err) console.log(err);
      else {
         console.log(data)
         object = data;
         
      }
   })
   console.log(object)
   return object;
   */
}