const express = require("express");
const { Address } = require("../models");
const router = express.Router();

router.get("/get/:uid", (req, res) => {
    Address.findAll({
        where: {
            userid: parseInt(req.params.uid)
        }
    }).then((addr) => {
        if(addr) {
            res.json({success: true, result: addr});
        }
    }).catch((error) => {
        res.status(error.statusCode).send(error.message);
    });
});

router.post("/add", (req, res) => {
    Address.findOne({
        where: {
            address: req.body.addr,
            userid: parseInt(req.body.userid)
        }
    }).then((addr) => {
        if(addr) {
            res.json({ success: false, msg: "This address already exist!"});
        } else {
            Address.create({
                userid: req.body.userid,
                nickname: req.body.nickname,
                address: req.body.addr,
                active: false
            }).then((result) => {
                res.json({success: true, result});
            })
        }
    }).catch((error) => {
        res.status(error.statusCode).send(error.message);
    });
});


router.post("/update", (req, res) => {
    Address.update({
        nickname: req.body.nickname,
        address: req.body.addr
    }, { 
        where: {
            id: req.body.id
        }
    }).then((result) => {
        if( result ) {
            res.json({
                success: true,
                result
            })
        } else {
            res.json({
                success: false,
                msg: "Updating failed!"
            })
        }
    }).catch((error) => {
        res.status(error.statusCode).send(error.message);
    });
});

router.post("/updateActive", (req, res) => {
    Address.update({
        active: req.body.active
    }, { 
        where: {
            id: parseInt(req.body.id)
        }
    }).then((result) => {
        if( result ) {
            res.json({
                success: true,
                result
            })
        } else {
            res.json({
                success: false,
                msg: "Updating failed!"
            })
        }
    }).catch((error) => {
        res.status(error.statusCode).send(error.message);
    });
});

router.get("/delete/:id", (req, res) => {
    Address.destroy({
        where: {
            id: parseInt(req.params.id)
        }
    }).then((addr) => {
            res.json({success: true, result: {id: req.params.id}});
    }).catch((error) => {
        res.status(error.statusCode).send(error.message);
    });
});

module.exports = router;
