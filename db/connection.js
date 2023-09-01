const mongoose=require('mongoose');
const config=require('../config/config');
console.log(config.password);
mongoose.connect(`mongodb+srv://arpangupta1003:${config.password}@usm.lp41xyd.mongodb.net/`,
process.env.MONGO_URL,
{
    useNewUrlParser:true,
    useUnifiedTopology:true

}).then(()=>{
    console.log("Connected to db");
}).catch((e)=>{
    console.log(`error is `+e);
});