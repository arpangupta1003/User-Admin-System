const mongoose=require('mongoose');
const config=require('../config');
// console.log(config.password);
mongoose.connect(`mongodb://127.0.0.1:27017/uasDB`,
process.env.MONGO_URL,
{
    useNewUrlParser:true,
    useUnifiedTopology:true

}).then(()=>{
    console.log("Connected to db");
}).catch((e)=>{
    console.log(`error is `+e);
});