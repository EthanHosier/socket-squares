const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        unique:true,
        required: true,
    },
    password: {
        type: String,
        minLength: 8,
        required: true,
    },
    coins: {
        type: Number,
        required: true,
        default: 100,
    },
    imgKey: {
        type: String,
        default: " ",
    },
    refreshToken:{
        type: String,
        default: "TOKEN"
    }
});


//virtual for image URL:
UserSchema
.virtual('imgUrl')
.get(function() {
    return `https://direct-upload-socket-squares-1.s3.eu-west-2.amazonaws.com/${this.imgKey}`;
});

//export schema as module
module.exports = mongoose.model("User", UserSchema);