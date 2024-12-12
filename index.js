//Basis SetUp
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError")

//Mongo Db
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/fakewatsapp');
}
main()
    .then(() => {
        console.log("Connection successfull");
    })
    .catch(err =>
        console.log(err)
    );

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));



//Express Js
app.get("/", (req, res) => {
    res.send("Home route")
});

//Index route
app.get("/chats", async (req, res) => {
    try{
        let chats = await Chat.find({});
        res.render("index.ejs", { chats });
    }
    catch(err){
        next(err);
    }
})

//New Route
app.get("/chats/new", (req, res) => {
    // throw new ExpressError(404,"Access Denied...");
    res.render("new.ejs");
})

//Create Route
app.post("/chats", (req, res) => {
    try{
        let { from, to, msg } = req.body;
        let newChat = new Chat({
            from: from,
            to: to,
            msg: msg,
            reached_at: new Date()
        })
        newChat.save()
        .then((res)=>{
            console.log(res);
        }).catch(err=>{
            console.log(err);
        })
        res.redirect("/chats");
    } catch(err){
        next(err);
    }
})

//AsyncWrap Function to avoid using try-catch block
function AsyncWrap(fn){
    return function(req,res,next){
        fn(req,res,next).catch(err);
    }
}

//NEW ROUTE
app.get("/chats/:id", AsyncWrap(async(req,res,next)=>{
    
        let {id} = req.params;
        let chat = await Chat.findById(id);
        if(!chat){
            next(new ExpressError(500,"Chat Not Found"));
        }
        res.render("edit.ejs",{chat});
        
}))

//Edit Route
app.get("/chats/:id/edit", async (req,res)=>{
    try{

        let {id} = req.params;
        let chat = await Chat.findById(id);
        res.render("edit.ejs",{chat});
    }catch(err){
        next(err);
    }
})

//Update Route
app.put("/chats/:id",async (req,res)=>{
    try{

        let {id} = req.params;
        let {msg :newMsg} = req.body;
        let updateChat = await Chat.findByIdAndUpdate(id , {msg:newMsg},{ runValidators:true , new:true});
        console.log(updateChat);
        res.redirect("/chats");
    }catch(err){
        next(err);
    }
})

//Destroy route
app.delete("/chats/:id",async (req,res)=>{
    try{

        let {id} = req.params;
        let deleted = await Chat.findByIdAndDelete(id);
        console.log(deleted);
        res.redirect("/chats");
    }catch(err){
        next(err);
    }
})

//Error handling middleware

const handleValidationErr = (err) =>{
    console.log("this is a validaton err! Please try again");
    console.dir(err.message);
    return err;
}

app.use((err,req,res,next)=>{
    console.log(err.name);
    if(err==="ValidationError"){
        handleValidationErr(err);
    }

    next(err);
});

app.use((err,req,res,next)=>{
    let {status=500 , message="Access Denied"} = err;
    res.status(status).send(message);
})

app.listen(8080, () => {
    console.log("app is listening to the port 8080");
});