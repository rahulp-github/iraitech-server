// User Schema
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name:{
        required:true,
        type:String
    },
    last_name:{
        required:true,
        type:String
    },
    email:{
        required:true,
        type:String
    },
    phone:{
        required:true,
        type:String
    },
    address:{
        required:true,
        type:String
    },
    password:{
        required:true,
        type:String
    }

});

const User = mongoose.model('users',userSchema);
module.exports = User;