const express=require('express');
const app=express();
require('./db/connection');
const hbs=require('hbs');
const path=require('path');
const bodyParser=require('body-parser');
const userRoute=require('./routes/userRoute');
const adminRoute=require('./routes/adminRoute');

const port=3000;


app.use('/',userRoute);
app.use('/admin',adminRoute);
const viewsPath=path.join(__dirname,"./views");
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "hbs");
app.set("views", viewsPath);









app.listen(port,()=>{
    console.log(`Server running successfully on PORT ${port}`);
});
module.exports=app;