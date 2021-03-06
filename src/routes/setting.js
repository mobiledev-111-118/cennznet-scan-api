const express = require("express");
const { Setting } = require("../models");
const utils = require("../utils");

const router = express.Router();

router.get("/get", (req, res) => {
    Setting.findAll().then((addr) => {
        if(addr) {
            res.json({success: true, result: addr});
        }
    }).catch((error) => {
        res.status(error.statusCode).send(error.message);
    });
});

router.post("/add", (req, res) => {
    Setting.findOne().then((addr) => {
        if(addr) {
            Setting.update({
                limit: parseInt(req.body.limit),
                start: parseInt(req.body.start),
                end: parseInt(req.body.end)
            }, {
                where: {
                    id: addr.id
                }
            }).then((updated) => {
                res.json({success: true, result: "Successfully updated!"});
            }).catch((err) => {
                res.json({success: false, result: "Updating failed!"});
            })
        } else {
            Setting.create({
                limit: parseInt(req.body.limit),
                start: parseInt(req.body.start),
                end: parseInt(req.body.end)
            }).then((added) => {
                res.json({success: true, result: "Successfully Added!"});
            })
        }
    }).catch((error) => {
        res.status(error.statusCode).send(error.message);
    });
});

router.get("/cennzholders/:id", (req, res) => {
    const page = parseInt(req.params.id);
    utils.getTopHolders(page).then((result) => {
        if( result ) {
            res.json({
                success: true,
                result
            })
        } else {
            res.json({
                success: false,
                msg: "Holders getting error!"
            })    
        }
    }).catch((err) => {
        res.json({
            success: false,
            msg: "Holders getting error!"
        })
    })
})

module.exports = router;
