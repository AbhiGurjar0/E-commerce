
const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const {generateToken} = require("../utils/generateToken") ;
module.exports.registerUser = async function(req,res){
    try{
        let {email,password,fullname} = req.body;
        if (!password) return res.status(400).send("Password is required");
        let user = await userModel.findOne({email:email});
        if(user) return res.status(401).send("Already created");
        bcrypt.genSalt(10,function(err,salt){
            if (err) return res.status(500).send(err.message);
            bcrypt.hash(password,salt, async function(err,hash){
                if (err) return res.status(500).send(err.message);
                if(err) return res.send(err.message);
                else{
                    let user = await userModel.create({
                        email,
                        password:hash,
                        fullname,
                    });
                    let token = generateToken(user);
                    res.cookie("token",token);
                    res.redirect("/");
                }
            })
        })
       
    }catch(err){
        console.log(err.message);
    }
}
module.exports.loginUser = async function(req,res){
    let {email,password} = req.body;
    if (!password) return res.status(400).send("Password is required");
    let user = await userModel.findOne({email:email});
    if(!user){
        return req.flash("error","email or password incorrect ");
        res.redirect("/my-account");

    } 

    bcrypt.compare(password,user.password,function(err,result){
        if(result){
            let token = generateToken(user);
            res.cookie("token",token);
            res.redirect("/"); 
        }  
        else{
            return req.flash("error","email or password incorrect ");
            res.redirect("/my-account");

        }

    })
}
module.exports.logout = function(req,res){
    res.cookie("token","");
    res.redirect("/");
} 