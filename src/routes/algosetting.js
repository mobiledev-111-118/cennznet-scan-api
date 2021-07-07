const express = require("express");

const { Algosetting } = require("../models");
const router = express.Router();

router.get("/get", (req, res) => {
    Algosetting.findAll().then((addr) => {
        if(addr) {
            res.json({success: true, result: addr});
        }
    }).catch((error) => {
        res.status(error.statusCode).send(error.message);
    });
});

router.post("/add", (req, res) => {
    Algosetting.findOne().then((addr) => {
        if(addr) {
            Algosetting.update({
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
            Algosetting.create({
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


module.exports = router;
