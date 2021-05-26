const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { User } = require("../models");
const config = require("../config/config");

const router = express.Router();

router.post("/signup", (req, res) => {
    User.findAll().then((user) => {
        if(user.length !== 0) {
            res.json({success: false, msg: "Admin already exist!"});
        } else {
            bcrypt.hash(req.body.password, config.bcrypt.saltRounds, (err, hash) => {
                User.create({
                    email: req.body.email,
                    password: hash
                }).then((result) => {
                    res.json({success: true, result});
                })
            })
        }
    }).catch((error) => {
        res.json({success: false, msg: error.message});
    });
});

router.post("/signin", (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then((user) => {
        if( user ) {
            bcrypt.compare(req.body.password, user.password).then((equal) => {

                if( equal ) {
                    res.json({success: true, result: user});
                } else {
                    res.json({success: false, msg: "There is no this user! Please signup!"});
                }
            })
        } else {
            res.json({success: false, msg: "There is no this user! Please signup!"});
        }
        
    }).catch((error) => {
        res.json({success: false, msg: error.message});
    });
});

module.exports = router;