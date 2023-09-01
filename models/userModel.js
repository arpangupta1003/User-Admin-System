const mongoose=require('mongoose');
const userModel=mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is mandatory"],
        minlength:[4,"Minimum 4 letters first name"]
    },
    
    email:{
        type:String,
        required:[true,"Email is mandatory"],
        unique:[true,"User already exists"]
    },
    pno:{
        type:String,
        required:[true,"Phone Number is mandatory"],
        unique:[true,"User already exists"],
        minlength:[10,"Invalid Phone Number"]
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minlength:[6,"Minimum 6 characters long"]
    },
    idAdmin:{
        type:Number,
        required: true,
        default:0
    },
    isVerified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:'',
    }
});

module.exports=new mongoose.model("UserManagementSystem_Model",userModel);