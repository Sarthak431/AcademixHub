import express from "express";

const app = express();


app.get('/',(req,res,next)=>{
    res.send("hello there ");
})




export default app;