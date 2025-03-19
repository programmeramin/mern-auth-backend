import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from './../Models/user.models.js';
import { generateTokenAndSetCookie } from "../generateTokenAndSetCookie.js";
import { createOTP } from "../Helpers/helpers.js";
import { 
  AccountActivationEmail, sendPasswordResetEmail, sendResetSuccessEmail } from "../Mailtrap/mailtrap.config.js";
  /*
    @desc signup
    @method POST
    @route /api/auth/signup
    @access public
  */ 
export const signup = async (req, res) =>{
  
  const {name, email, password} = req.body;

    // verify
    if(!email || !password || !name){
      return res.status(404).json({success : false, message : "All fields are requird"})
    }

  const otp = createOTP();
 
  try {
     
    if(!name || !email || !password){
      throw new Error("All fields are required");
    }
   
    const userAllreadyExists = await User.findOne({email});

    if(userAllreadyExists){
      return res.status(400).json({success : false, message : "User allready exist"});

    }

    // hass password
    const hassPass = await bcrypt.hash(password, 10);
    // token create
    const verificationToken = Math.floor(100000 + Math.random() + 900000).toString();

    // create user
    const user = await User.create({
      name,
      email,
      password : hassPass,
      accessToken : otp,
      verificationToken,
      verificationTokenExpiresAt : Date.now() + 24 * 60 * 60 * 1000, // 23 hours

    });

    if(user){
      // jwt
     generateTokenAndSetCookie(res, user._id);

    //  sendVerificationEmail(user.email, verificationToken);

     if(email){

      // send Otp
      await AccountActivationEmail(email,{ code : otp});

     }

    }

    await user.save();

  
     res.status(201).json({
      success : true,
      message : "User created successfully",
      user : {
        ...user._doc,
        password : undefined,
      },
     });

  } catch (error) {
    res.status(400).json({success : false, message : error.message});
  }

}


/**
 @description verify otp
 @method POST
 @route /api/auth/verify-otp
 @access public
 */

 export const verifyEmail = async (req, res) =>{

  const {code} = req.body;

  if(!code){
    return res.status(400).json({success : false, message : "Verification code is required"})
  }
  
  // validation
  if(!code){
    return res.status(400).json({
      success : false, message : "Invalid verification code"
    })
  }   

  const user = await User.findOne({
    accessToken  : code,
    verificationTokenExpiresAt : {$gt : Date.now()}
  });

  if(!user){
    return res.status(404).json({success : false, message : "Invalid or expired verification code"});
  };

  user.isVerified = true;
  user.accessToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  res.status(200).json({
    success : true,
    message : "Email verified successfully",
    user : {
      ...user._doc,
      password : undefined,
    }
  })


  }

  // /*
  //   @desc login
  //   @method POST
  //   @route /api/auth/login
  //   @access public
  // */
    export const login = async (req, res)=>{
      
      const {email, password } = req.body;

      // verify
      if(!email || !password){
        return res.status(404).json({success : false, message : "All fields are requird"})
      }

      const user = await User.findOne({email});
      if(!user){
        return res.status(404).json({success : true, message : "User not found"});

      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if(!isPasswordValid){
        return res.status(404).json({success : false, message : "Wrong password"});
      }

      generateTokenAndSetCookie(res, user._id);

      user.lastLogin = new Date();
      await user.save();

      res.status(200).json({
        success : true,
        message : "Logged in successfully",
        user : {
          ...user._doc,
          password : undefined,
        },
      });

    }

    // /*
  //   @desc forgot password
  //   @method POST
  //   @route /api/auth/forgot-password
  //   @access public
  // */
  export const forgotPassword = async (req, res) => {

    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ success: false, message: "User not found" });
      }
  
      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiresAt = resetTokenExpiresAt;
  
      await user.save();

      // send email
      await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
     
      res.status(200).json({ success: true, message: "Password reset link sent to your email" });

    } catch (error) {
      console.log("Error in forgotPassword ", error);
      res.status(400).json({ success: false, message: error.message });
    }
  };     
  

        // /*
  //   @desc reset password
  //   @method POST
  //   @route /api/auth/reset-password
  //   @access public
  // */

  export const resetPassword = async (req, res) =>{

    const { token} = req.params;
    const {password} = req.body;

    try {

      const user = await User.findOne({
        resetPasswordToken : token,
        resetPasswordExpiresAt : {$gt : Date.now()},
      });
  
      if(!user){
        return res.status(400).json({success : false, message : "Invalid or expired reset token"})
      }
   
      // update password
      const hassPass = await bcrypt.hash(password, 10);
  
      user.password = hassPass;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;
  
      await user.save();
  
      await sendResetSuccessEmail(user.email);
  
      res.status(200).json({success : true, message : "Password reset successfully"
      });
    } catch (error) {
      
     console.log(`Error in resetPassword ${error}`);
      
     res.status(400).json({success : false, message : error.message})
    }
  
  }
  
  /*
    @desc checkAuth
    @method POST
    @route /api/auth/checkAuth
    @access public
  */
      
    export const checkAuth = async (req, res) =>{
    
      try {
        
        const user = await User.findById(req.userId).select("-password");

        if(!user){
          return res.status(404).json({success : false, message : "User not found"});
        }

        res.status(200).json({success : true, user : {
          ...user._doc,
          password : undefined
        }});
 
      } catch (error) {
         console.log("Error in checkAuth", error);
         res.status(400).json({success : false, message : error.message})
  }
   
  

    }

       
  /*
    @desc logout
    @method POST
    @route /api/auth/logout
    @access public
  */
export const logout = async (req, res) =>{
 
  res.clearCookie("token");
  res.status(200).json({success : true, message : "Logout successfully"});
  
}        