const mongoose=require('mongoose');
const questionModel=mongoose.Schema({
    question:{
        type:String,
        minlength:[5,"Invalid Question"],
        required:true
    },
    author:{
        type:String,
        default:"Anonymous",
    },
    dateCreated:{
        type:Date,
        default:Date.now,
    },
    answer:{
        type:String,
        minlength:[1,"Invalid Answer"],
        default:""
    },
    answerAuthor:{
        type:String,
        default:"Anonymous",
    }

});
module.exports=new mongoose.model("UserQuestion_Model",questionModel);