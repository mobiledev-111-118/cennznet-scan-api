const express = require("express");
const { Algoholder } = require("../models");
const router = express.Router();

router.get("/get", (req, res) => {
    Algoholder.findAll().then((addr) => {
        if(addr) {
            res.json({success: true, result: addr});
        }
    }).catch((error) => {
        res.json({ success: false, msg: error.message});
    });
});

router.post("/add", (req, res) => {
    Algoholder.findOne({
        where: {
            address: req.body.addr,
        }
    }).then((addr) => {
        if(addr) {
            Algoholder.update({
                nickname: req.body.nickname,
            }, { 
                where: {
                    address: req.body.addr
                }
            }).then((result) => {
                res.json({
                    success: true,
                    result
                })
            })
        } else {
            Algoholder.create({
                nickname: req.body.nickname,
                address: req.body.addr,
            }).then((result) => {
                res.json({success: true, result});
            })
        }
    }).catch((error) => {
        res.json({ success: false, msg: error.message});
    });
});

router.get("/delete/:id", (req, res) => {
    Algoholder.destroy({
        where: {
            id: parseInt(req.params.id)
        }
    }).then((addr) => {
            res.json({success: true, result: {id: req.params.id}});
    }).catch((error) => {
        res.json({ success: false, msg: error.message});
    });
});

module.exports = router;
