require('dotenv').config();

const mongoose = require('mongoose');
const localDB = process.env.DATABASE_URL;
const connectDB = async() =>{
    await mongoose.connect(localDB, {
        useNewUrlParser:true,
        useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
}

module.exports = connectDB;