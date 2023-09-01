const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const path = require('path');
const hbs = require('hbs');
const express = require('express');
const session = require('express-session');
const randomstring = require('randomstring');
const nodemailer=require('nodemailer');

const app = express();

const secureThePassword = async (password) => {
    const securePassword = await bcrypt.hash(password, 10);
    return securePassword;
}

const viewsPath = path.join(__dirname, "../views");
app.set("view engine", "hbs");
app.set("views", viewsPath);


const sendVerifyMail = async (name, email, user_id,password) => {

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'tester201003@gmail.com',
            pass: 'axleclwtfteuttml'
        }
    });

    let info = await transporter.sendMail({
        from: '"Tester" <tester201003@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "OTP for verification ✔", // Subject line
        html: '<p> Hii ' + name + ', please click here to <a href="http://localhost:3000/verify?id=' + user_id + '"> Verify your mail.</a></p> <p> Your Registered Email is'+email+'</p><p>Your password is : '+password+',</p>'
    });
}



const loadLogin = async (req, res) => {
    try {
        res.render('loginAdmin');
    }
    catch (err) {
        console.log("Error in the Load Login(Admin) method is " + err.message);
    }
}

const sendResetPasswordMail = async (name, email, token) => {

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'tester201003@gmail.com',
            pass: 'axleclwtfteuttml'
        }
    });

    let info = await transporter.sendMail({
        from: '"Tester" <tester201003@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "OTP for verification ✔", // Subject line
        html: '<p> Hii ' + name + ', please click here to <a href="http://localhost:3000/admin/forget-password?token=' + token + '"> Forget </a>your password.</p>'
    });
}

const verifyMail = async (req, res) => {
    try {
        const updatedInfo = await User.updateOne({ _id: req.query.id }, { $set: { isVerified: 1 } });
        console.log("Updated information is " + updatedInfo);
        res.render("emailVerified");
    }
    catch (err) {
        if (err.message !== 'undefined') {
            console.log(err.message);
        }
    }
}


const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            console.log(userData);
            if (passwordMatch) {
                if (userData.isVerified === 1) {
                    if (userData.idAdmin === 1) {
                        req.session.user_id = userData._id;
                        const user = await User.findById({ _id: req.session.user_id });
                        res.render('homeAdmin', { user: user });
                    }
                    else {
                        res.render('loginAdmin', { message: "Sorry You are not an Admin" });
                    }
                }
                else {
                    res.render('loginAdmin', { message: "Please Verify Your Mail" });
                }
            }
            else {
                res.render('loginAdmin', { message: "Invalid Login Credentials" });
            }
        }
        else {
            res.render('loginAdmin', { message: "Admin Does Not Exit with this Mail ID" });
        }
    }
    catch (err) {
        console.log("Error in the Verify Login Method(Admin) is " + err.message);
    }
}

const adminLogOut = async (req, res) => {
    try {
        req.session.destroy();
        console.log('Logout successful');
        res.render('loginAdmin');
    }
    catch (err) {
        console.log(err.message);
    }
}

const loadDashboard = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.session.user_id });
        console.log(user);
        res.render('homeAdmin', { user: user });
    }
    catch (err) {
        console.log("Error in the load dashboard admin method is " + err.message);
    }
}

const loadForget = async (req, res) => {
    try {
        res.render('forgetAdmin');
    }
    catch (err) {
        console.log("Error in the Load Forget Method Admin is " + err.message);
    }
}
const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            if (userData.isVerified === 0) {
                res.render('forgetAdmin', { message: "Please Verify Your Mail first" })
            }
            else {
                if (userData.idAdmin === 0) {
                    res.render('forgetAdmin', { message: "Sorry You are not an Admin" })
                }
                else {
                    const randomString = randomstring.generate();
                    const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
                    sendResetPasswordMail(userData.name,userData.email,randomString);
                    res.render('forgetAdmin', { message: "Please Check Your Mail" });
                }
            }
        }
        else {
            res.render('forgetAdmin', { message: "Email Does Not Exist/Is Invalid" })
        }
    }
    catch (err) {
        console.log("Error in the Forget Verify(Admin) Method is " + err.message);
    }
}

const loadForgetPassword=async(req,res)=>{
    try{
        const token=req.query.token;
        const tokenData=await User.findOne({token:token});
        res.render('forget-passwordAdmin',{user_id:tokenData._id});
    }
    catch(err){
        console.log("Error in the Load Forget Password Admin Method is "+err.message);
        res.render('404');
    }
}

const updatePassword=async(req,res)=>{
    try{
        const newPassword=req.body.password;
        const user_id=req.body.user_id;
        const secureNewPassword=await secureThePassword(newPassword);
        const userData=await User.findById({_id:user_id});
        console.log(userData);
        const updatedResult=await User.updateOne({_id:user_id},{$set:{password:secureNewPassword,token:""}});
        console.log(updatedResult);
        res.redirect('/admin/login');
    }
    catch(err){
        console.log("Error in the Update Password Admin method is "+err.message);
    }
}

const Userlist=async(req,res)=>{
    try{
        const user=await User.find({idAdmin:0});
        console.log(user[3].name);
        res.render('UserlistAdmin',{users:user});
    }
    catch(err){
        console.log("Error in the userList Admin method is "+err.message);
    }
}

const newUserLoad=async(req,res)=>{
    try{
        res.render('newUserAdd');
    }
    catch(err){
        console.log("Error in the New User Load Admin method is "+err.message);
    }
}

const newUser=async(req,res)=>{
    try{
        const name=req.body.name;
        const email=req.body.email;
        const pno=req.body.pno;
        const password= randomstring.generate(8);
        const securePassword=await secureThePassword(password);
        const user=new User({
            name:req.body.name,
            email:req.body.email,
            pno:req.body.pno,
            password:securePassword
        });
        const userData=await user.save();
        if(userData){
            console.log("User Registered with the data : "+userData);
            sendVerifyMail(userData.name,userData.email,userData._id,password);
            res.redirect('/admin/Userlist');
        }
    }
    catch(err){
        console.log("Error in the new user admin method is "+err);
    }
}

const deleteUser=async(req,res)=>{
    res.render('deleteUser');
}

const removeUserData=async(req,res)=>{
    try{
        const email=req.body.email;
        const userData=await User.findOne({email:email});
        console.log(userData);
        if(userData){
            const updatedData=await User.deleteOne({email:email});
            if(updatedData){
                console.log("User Deleted Sucessfully");
                res.render('UserlistAdmin');
            }
            else{
                res.render('deleteUser',{message:"User Not Deleted, Try again"})
            }
        }
        else{
            res.render('deleteUser',{message:"User does not exist with this email"});
        }
    }
    catch(err){
        console.log("Error in the remove user data Admin method is "+err.message);
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    adminLogOut,
    loadDashboard,
    loadForget,
    forgetVerify,
    loadForgetPassword,
    updatePassword,
    Userlist,
    newUserLoad,
    newUser,
    verifyMail,
    deleteUser,
    removeUserData
}