const User = require('../models/userModel');
const hbs = require('hbs');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

app.use(express.json());
const viewsPath = path.join(__dirname, "../template");
console.log("Views Path is " + viewsPath);
app.set("view engine", "hbs");
app.set("views", viewsPath);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const sendVerifyMail = async (name, email, user_id) => {

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
        subject: "Account Verify Mail", // Subject line
        html: '<p> Hii ' + name + ', please click here to <a href="https://usm-q0pk.onrender.com/verify?id=' + user_id + '"> Verify your Email.</a></p>'
    });
}


const secureThePassword = async (password) => {
    const securePassword = await bcrypt.hash(password, 10);
    return securePassword;
}

const loadRegister = (req, res) => {
    try {
        // console.log(req.body);
        res.render('registration');
        console.log("Registration successful");
    }
    catch (err) {
        console.log(err);
    }
};

const insertUser = async (req, res) => {
    try {
        console.log(req.body);
        const securePassword = await secureThePassword(req.body.password);
        const user = User({
            name: req.body.name,
            email: req.body.email,
            pno: req.body.pno,
            password: securePassword,
            isAdmin: 0,
        });
        const data = await user.save();
        if (data) {
            sendVerifyMail(req.body.name, req.body.email, data._id);
            res.render('registration', { message: "Your registration has been successfully done!!, Please Verify Your Mail." });
        }
        else {
            res.render('registration', { message: "Sorry, Your registration has been failed" });
        }
    }
    catch (err) {
        if (err.message !== "undefined") {
            console.log(err.message);
        }
    }
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


//Login User Starts

const loadLogin = async (req, res) => {
    try {
        res.render('login');
    }
    catch (err) {
        if (err.message !== 'undefined') {
            console.log("Error in the load Login method is " + err.message)
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
            if (passwordMatch) {
                if (userData.isVerified === 0) {
                    res.render('login', { message: "Please verify your mail first" });
                }
                else {
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                }
            }
            else {
                res.render('login', { message: " Email or the Password is incorrect, Please try again" });
            }
        }
        else {
            res.render('login', { message: " Email or the Password is incorrect, Please try again" });
        }
    }
    catch (err) {
        if (err.message !== 'undefined') {
            console.log("Error in the Verify Login method is " + err.message)
        }
    }
}
const loadHome = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.session.user_id });
        res.render('home', { user: user });
    }
    catch (err) {
        if (err.message != 'undefined') {
            console.log("Error in the Load Home method is " + err.message);
        }
    }
}
const userLogOut = async (req, res) => {
    try {
        req.session.destroy();
        console.log('Logout successful');
        res.redirect('/');
    }
    catch (err) {
        console.log(err.message);
    }
}

const loadForget = async (req, res) => {
    try {
        res.render('forget');
    }
    catch (err) {
        console.log("error in the loadFOrget method is " + err.message);
    }
}

const sendForgetMail = async (name, email, token) => {

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
        html: '<p> Hii ' + name + ', please click here to <a href="https://usm-q0pk.onrender.com/forget-password?token=' + token + '"> Forget </a>your password.</p>'
    });
}

const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            if (userData.isVerified === 0) {
                res.render('forget', { message: "Please verify your mail first" });
            }
            else {
                const randomString = randomstring.generate();
                console.log(randomString);
                const updatedResult = await User.updateOne({ email: email }, { $set: { token: randomString } });
                console.log(updatedResult);
                console.log(userData.name);
                sendForgetMail(userData.name, req.body.email, randomString);
                res.render('forget', { message: "Please Check your mail" });
            }
        }
        else {
            res.render('forget', { message: "User Mail does not exist/ is Invalid" });
        }
    }
    catch (err) {
        console.log("Error in the Forget Verify method is " + err.message);
    }
}

const loadForgetPassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id });
        }
        else {
            res.render('404', { message: "Token Not Found" });
        }
    }
    catch (err) {
        console.log("Error in the load forget apssword method is " + err.message);
    }
}
const updatePassword = async (req, res) => {
    try {
        const newPassword = req.body.password;
        const user_id = req.body.user_id;
        const secureNewPassword = await secureThePassword(newPassword);
        const userData = await User.findById({ _id: user_id });
        console.log(userData);
        const updatedResult = await User.updateOne({ _id: user_id }, { $set: { password: secureNewPassword, token: "" } });
        console.log(updatedResult);
        res.redirect('/login');
    }
    catch (err) {
        console.log("Error in the update password method is " + err);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loadLogin,
    verifyLogin,
    loadHome,
    userLogOut,
    loadForget,
    forgetVerify,
    loadForgetPassword,
    updatePassword
};