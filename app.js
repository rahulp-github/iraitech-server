const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./user_module.js');
const bcrypt = require('bcryptjs');

/*------------------------------------------------------------------------------------------------
                                        End OF Imports                                          
------------------------------------------------------------------------------------------------*/

const app = express();

const PORT = process.env.PORT || 8080;

const secretKey = "thisIsSecretKey";

let conn_string = 'mongodb+srv://rahul:rahul@cluster0.rb9pz.mongodb.net/iraitech?retryWrites=true&w=majority';

// Connect to atlas database
mongoose.connect(conn_string, { useNewUrlParser:true, useUnifiedTopology:true})
    .then( () => console.log("Connected to Atlas Database Successfully"))
    .catch( (err) => console.log("Error : ", err));

// Body-parser
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// Cors Policy
app.use(cors());

app.get('/',(req,res) => {
    res.send("<h1> Hii ! </h1>");
});

// New User Registration endpoint
app.post('/register',async (req,res) => {
    try{
        const {first_name,last_name,email,phone,address} = req.body;
        //Password Hashing
        const password = await bcrypt.hash(req.body.password,10);
        let user = await User.findOne({email:email});
        if(user) return res.json({"status":"error","message":"User Already Exists"});
        else{
            const newUser = User.create({
                first_name:first_name,
                last_name:last_name,
                email:email,
                phone:phone,
                address:address,
                password:password
            });
            res.status(200);
            return res.json({"status":"ok","message":"Registration Successfull"});
        }
    }
    catch(e){
        res.status(500);
        return res.json({"status":"error","message":`Error ${e}`});
    }
});

// Login Endpoint
app.post('/login',async (req,res) => {
    const email = req.body.email;
    const user = await User.findOne({email});
    if(!user) {
        return res.json({"status":"error","message":"Invalid Email or Password"});
    }
    try {
        // Comparing hashed passwords
        const valid = await bcrypt.compare(req.body.password,user.password);
        if(valid){
            const token = await jwt.sign({
                   first_name:user.first_name,
                   user_id:user._id
                },
                secretKey
            )
            res.status(200);
            return res.json({"status":'ok',"token":token});
        }
        else{
            res.status(401);
            return res.json({"status":"error","message":"Invalid Email Or Password"});
        }
    }
    catch(e){
        res.status(500)
        return res.json({"status":"error","message":`Error ${e}`});
    }

});

// Profile Endpoint
app.get('/profile',isAuthenticated,async (req,res) => {
    try{
        const decoded = jwt.verify(req.token,secretKey);
        const user_id = decoded.user_id;
        let user = await User.findOne({_id:user_id});
        const profile = {
            first_name:user.first_name,
            last_name:user.last_name,
            email:user.email,
            phone:user.phone,
            address:user.address
        };
        res.status(200);
        res.json({"status":"ok","profile":profile});
    }
    catch(e){
        res.status(500)
        return res.json({"status":"error","message":`Error ${e}`});
    }
});

// Check for token
function isAuthenticated(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      req.token = bearerToken;
      next();
    } else {
      // ForBidden
      res.sendStatus(403);
    }
}

app.listen(PORT,(req,res) => {
    console.log(`Listening on Port ${PORT}`);
});
