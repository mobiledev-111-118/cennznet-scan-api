const express = require("express");
const { Algoasset, Algoaddress } = require("../models");
const router = express.Router();

const { algo_link } = require("../config/urls");

const telegramServices = require("../telegramServices");

const utils = require("../utils");

let assetData = [];
let addressData = [];
let start = 0;

utils.getLatestBlockNumber().then((res) => {
    if( res ) {
        start = res.lastRound;
        utils.updateAlgoSetting(start);
    }
})

function getAssets() {
    try {
        Algoasset.findAll().then((res) => {
            if(res) {
                const temp2 = [];
                res.forEach(element => {
                    temp2.push(element.dataValues);
                });
                assetData = temp2;
            }
        });
        Algoaddress.findAll().then((res) => {
            const temp = []
            if( res ) {
                res.forEach((element) => {
                    temp.push(element.dataValues);
                });
                addressData = temp;
            }
        })
    } catch (e) {
        console.log("err in getting setting data :: ", e)
    }
}

async function getSystemEvents() {
    try{
        const temp = await utils.getLatestBlockNumber();
        const end = temp.lastRound;
        await processAddressTracking(end);
        setTimeout(() => {
            processAssetsTracking(end);
        }, 1000)
    } catch(error) {
        console.log(error)
        setInterval(getSystemEvents, 30000);
    }
}

async function processAssetsTracking(end) {
    assetData.forEach((element, index) => {
        const decimals = parseInt(element.tkdecimal);
        const divide = Math.pow(10, decimals);
        utils.getTransactionsByAsset(element.address, parseInt(element.qty)*divide, start, end).then((res) => {
            if( res && res?.length ) {
                res.forEach(async (tx) => {
                    if( !IsExist(tx.sender) && !IsExist(tx[`asset-transfer-transaction`][`receiver`])) {
                        const nickname = element.nickname;
                        const tkname = element.tkname;
                        const amt = (parseInt(tx[`asset-transfer-transaction`][`amount`])/divide).toFixed(4);
                        sendNotifyByAsset(tx.id, tx.sender, nickname, tkname, amt);
                    }
                })
            }
        })
        if( index === assetData.length - 1 && start !== end ){
            start = end;
            utils.updateAlgoSetting(end);
        }
    })
}

function sendNotifyByAsset(txId, addr, nickname, tkname, amt) {
    const today = new Date();
    const date = today.toUTCString();
    const body = `<i>Token: </i><b>${tkname}</b>\n<i>Qty: </i><b>${amt}</b>\n<i>DateTime: </i><i>${date}</i>\n<i>Link: </i><a href="${algo_link}${txId}">${txId}</a>`;
    telegramServices.sendNotificationToLimitedAlgo(body);
}

async function processAddressTracking(end) {
    addressData.forEach((element) => {
        utils.getTransactionsByAddress(element.address, start, end).then((res) => {
            if( res && res?.length ) {
                res.forEach(async (tx) => {
                    const inout = tx.sender === element.address? "OUT" : "IN";
                    const curAsset = tx[`payment-transaction`]? {decimals: 0, unit: "ALGO"}: await utils.getAssetOne(tx[`asset-transfer-transaction`][`asset-id`]);
                    const nickname = element.nickname;
                    const tkname = curAsset.unit;
                    const amt1 = tx[`payment-transaction`]? tx[`payment-transaction`][`amount`] : tx[`asset-transfer-transaction`][`amount`];
                    const dec = parseInt(curAsset.decimals);
                    const divide = Math.pow(10, dec);
                    const amt = (parseInt(amt1)/divide).toFixed(4);
                    if( parseInt(amt1) > 0 ) {
                        sendNotifyByAddr(tx.id, element.address, inout, nickname, tkname, amt, element.active);
                    }
                })
            }
        })
    })
}

function sendNotifyByAddr(txId, addr, inout, nickname, tkname, amt, active) {
    const today = new Date();
    const date = today.toUTCString();

    const body = `<i>NickName: </i><b>${nickname}</b>\n<i>Token: </i><b>${tkname}</b>\n<i>Qty: </i><b>${amt}(${inout})</b>\n<i>Wallet: </i><i>${addr}</i>\n<i>DateTime: </i><i>${date}</i>\n<i>Link: </i><a href="${algo_link}${txId}">${txId}</a>`;
    if (active) {
        telegramServices.sendNotificationToHurryUpAlgo(body);
    } else {
        telegramServices.sendNotificationAlgo(body);
    }
}

function IsExist(addr) {
    const temp = addressData.filter((item) => item.address === addr)
    return temp.length; 
}

router.get("/get/:uid", async (req, res) => {
    Algoasset.findAll().then((data) => {
        if(data) {
            res.json({success: true, result: data});
        } else {
            res.json({success: false, result: []});
        }
    }).catch((error) => {
        res.json({ success: false, msg: error.message});
    });
});

router.get("/delete/:id", (req, res) => {
    Algoasset.destroy({
        where: {
            id: parseInt(req.params.id)
        }
    }).then((addr) => {
        res.json({success: true, result: {id: req.params.id}});
    }).catch((error) => {
        res.json({ success: false, msg: error.message});
    });
});

router.post("/add", (req, res) => {
    Algoasset.findOne({
        where: {
            address: req.body.address
        }
    }).then((addr) => {
        if(addr) {
            res.json({ success: false, msg: "This asset already is being tracking!"});
        } else {
            Algoasset.create({
                userid: parseInt(req.body.userid),
                nickname: req.body.nickname,
                address: req.body.address,
                tkname: req.body.tkname,
                qty: parseInt(req.body.qty),
                tkdecimal: parseInt(req.body.tkdecimal)
            }).then((result) => {
                res.json({success: true, result});
            })
        }
    }).catch((error) => {
        res.json({ success: false, msg: error.message});
    });
});

router.post("/update", (req, res) => {
    Algoasset.update({
        nickname: req.body.nickname,
        address: req.body.address,
        tkname: req.body.tkname,
        qty: parseInt(req.body.qty),
        tkdecimal: parseInt(req.body.tkdecimal)
    },{
        where: {
            id: req.body.id
        }
    }).then((addr) => {
        if(addr) {
            res.json({
                success: true,
                result: addr
            })
        } else {
            res.json({
                success: false,
                msg: "Updating failed!"
            })
        }
    }).catch((error) => {
        res.json({ success: false, msg: error.message});
    });
});

setInterval(getAssets, 8000);

setInterval(getSystemEvents, 30000);

module.exports = router;
