const express = require("express");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt")

dotenv.config()

const databaseUrl = process.env.DATABASE_URL;
mongoose.connect(databaseUrl)

const saltRounds = 10

const app = express();
app.use(express.json());

app.post("/signup", async function(req, res) {
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password, saltRounds);
    const name = req.body.name;

    try{
        await UserModel.create({
            email: email,
            password: password,
            name: name
        });
        
        res.json({
            message: "You are signed up"
        })
    }
    catch(err){
        console.log(err)
        res.json({
            "message":"You have already signed up!"
        })
    }
});


app.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email: email
    })

    
    if(!user){
        return res.status(403).send({
            "message":"Invalid creds"
        })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(403).send({
            "message":"Invalid creds"
        })
    }

    const token = jwt.sign({
        id: user._id.toString()
    }, JWT_SECRET)

    res.json({
        token: token
    })
});


app.post("/todo", auth, async function(req, res) {
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;
    await TodoModel.create({
        userId,
        title,
        done,
    });

    res.json({
        message: "Todo created"
    })
});


app.get("/todos", auth, async function(req, res) {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    });

    res.json({
        todos
    })
});

app.listen(3000, ()=> {
    console.log("Server is running")
});