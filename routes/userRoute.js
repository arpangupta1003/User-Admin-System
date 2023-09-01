const express=require('express');
const user_Route=express();
const bodyParser=require('body-parser');
const userController=require('../controllers/userController');
const config=require('../config/config');
const session=require('express-session');
const auth=require('../middlewares/auth');

user_Route.use(session({secret:config.sessionSecret}));
user_Route.use(bodyParser.json());
user_Route.use(bodyParser.urlencoded({extended:true}));


user_Route.get('/register',auth.isLogout,userController.loadRegister);
user_Route.post('/register',userController.insertUser);

user_Route.get('/verify',userController.verifyMail);

user_Route.get('/',auth.isLogout,userController.loadLogin);
user_Route.get('/login',auth.isLogout,userController.loadLogin);
user_Route.post('/login',userController.verifyLogin);

user_Route.get('/home',auth.isLogin,userController.loadHome);

user_Route.get('/logout',auth.isLogin,userController.userLogOut);

user_Route.get('/forget',auth.isLogout,userController.loadForget);
user_Route.post('/forget',userController.forgetVerify);
user_Route.get('/forget-password',auth.isLogout,userController.loadForgetPassword);
user_Route.post('/forget-password',userController.updatePassword);
module.exports=user_Route;

