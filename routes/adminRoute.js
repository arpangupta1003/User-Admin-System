const express = require('express');
const path = require('path');
const adminController = require('../controllers/adminController');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const session = require('express-session');
const config = require('../config/config');

const admin_Route = express();

admin_Route.use(session({ secret: config.sessionSecret }));
admin_Route.use(bodyParser.json());
admin_Route.use(bodyParser.urlencoded({ extended: true }));
const viewsPath = path.join(__dirname, "../views");
const auth = require('../middlewares/authAdmin');

admin_Route.set("view engine", "hbs");
admin_Route.set("views", viewsPath);



admin_Route.get('/', auth.isLogout, adminController.loadLogin);
admin_Route.get('/login', auth.isLogout, adminController.loadLogin);
admin_Route.get('/home',adminController.loadDashboard);
admin_Route.post('/login', adminController.verifyLogin);
admin_Route.post('/',adminController.verifyLogin);

admin_Route.get('/logout',auth.isLogin,adminController.adminLogOut);
admin_Route.get('/forget',auth.isLogout,adminController.loadForget);
admin_Route.post('/forget',adminController.forgetVerify);

admin_Route.get('/forget-password',auth.isLogout,adminController.loadForgetPassword);
admin_Route.post('/forget-password',adminController.updatePassword);


admin_Route.get('/Userlist',adminController.Userlist);

admin_Route.get('/newUser',auth.isLogin,adminController.newUserLoad);
admin_Route.post('/newUser',adminController.newUser);

admin_Route.get('/verify',auth.isLogout,adminController.verifyMail);

admin_Route.get('/deleteUser',auth.isLogin,adminController.deleteUser);
admin_Route.post('/deleteUser',adminController.removeUserData);

admin_Route.get('*', auth.isLogout,adminController.loadLogin);



module.exports = admin_Route;