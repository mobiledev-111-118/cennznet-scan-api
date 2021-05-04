const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { User } = require("../models");
const config = require("../config/config");

const router = express.Router();

router.post("/signup", (req, res) => {
    console.log("signup api :: ", req.body)
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then((user) => {
        if(user) {
            res.status(400).send("This email already exist!");
        } else {
            bcrypt.hash(req.body.password, config.bcrypt.saltRounds, (err, hash) => {
                User.create({
                    email: req.body.email,
                    password: hash
                }).then((result) => {
                    res.json(result);
                })
            })
        }
    }).catch((error) => {
        res.status(error.statusCode).send(error.message);
    });
});

router.post("/signin", (req, res) => {
    console.log("signin api :: ", req.body)
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then((user) => {
        bcrypt.compare(req.body.password, user.password).then((equal) => {

            if( equal ) {
                console.log("exist user :: ", user.id, user.email, user.password);
                res.json(user);
            } else {
                res.status(400).send("There is no this user! Please signup!");
            }
        })
    }).catch((error) => {
        res.status(error.statusCode).send(error.message);
    });
});

module.exports = router;