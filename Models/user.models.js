import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name : {
        type : String,
        required : true,
        trim : true,
    },

    email : {
        type : String,
        required : true,
        trim : true,
    },

    password : {
        type : String,
        required : true,
        
    },

    lastLogin : {
        type :  Date,
        default : Date.now,
    },

    isVerified : {
        type : Boolean,
        default : false
    },
    
    accessToken: {
        type: String,
        default: null,
        trim: true,
      },

    resetPasswordToken : String,
    resetPasswordExpiresAt : Date,
    verificationToken : String,
    verificationTokenExpiresAt : Date,

},{timestamps : true});

export const User = mongoose.model("User", userSchema);