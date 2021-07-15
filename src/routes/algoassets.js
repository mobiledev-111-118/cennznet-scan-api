const express = require("express");
const { Algoasset, Algoaddress } = require("../models");
const router = express.Router();

const { algo_link, AlgoAssets } = require("../config/urls");

const telegramServices = require("../telegramServices");

const utils = require("../utils");

let assetData = [];
let addressData = [];
let start = 0;

let intervalId = 0;
let intervalId1 = 0;
let bigData = [];
let bigData1 = [];
let timer1 = null;
let timer2 = null;

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
        await processAssetsTracking(end);
    } catch(error) {
        console.log(error)
        setInterval(getSystemEvents, 80000);
    }
}

async function processAssetsTracking(end) {
    const today = new Date();
    const date = today.toUTCString();
    assetData.forEach((element, index) => {
        const decimals = parseInt(element.tkdecimal);
        const divide = Math.pow(10, decimals);
        utils.getTransactionsByAsset(element.address, parseInt(element.qty)*divide, start, end).then((res) => {
            let temp = [];
            let body = [];
            if( res && res.length > 0 ) {
                res.forEach(async (tx, idx) => {
                    if( !IsExist(tx.sender) && !IsExist(tx[`asset-transfer-transaction`][`receiver`])) {
                        const tkname = element.tkname;
                        const amt = (parseInt(tx[`asset-transfer-transaction`][`amount`])/divide).toFixed(4);
                        if( !IsExistTx(temp, tx.id) ) {
                            const item = `<i>Token: </i><b>${tkname}</b>\n<i>Qty: </i><b>${amt}</b>\n<i>DateTime: </i><i>${date}</i>\n<i>Link: </i><a href="${algo_link}${tx.id}">${tx.id}</a>`
                            bigData.push(item);
                            temp.push(tx.id);
                        }
                    }
                    if( !timer1 && idx === res.length - 1) {
                        sendNotifyByAsset(body);
                        temp = [];
                    }
                    if( index === assetData.length - 1 && start !== end && idx === res.length - 1 ){
                        start = end;
                        utils.updateAlgoSetting(end);
                    }
                })
            } else if( index === assetData.length - 1 && start !== end ){
                start = end;
                utils.updateAlgoSetting(end);
            }
        })
        
    })
}

function sendNotifyByAsset(body) {
    timer1 = setInterval(() => {
        if( intervalId === bigData.length || bigData.length === 0 ) {
            clearInterval(timer1);
            timer1 = null;
            intervalId = 0;
            bigData = [];
        } else {
            // telegramServices.sendNotificationToLimitedAlgo(bigData[intervalId]);
            intervalId++;
        }
    }, 2500)
}

async function processAddressTracking(end) {
    let curAsset = null;
    const today = new Date();
    const date = today.toUTCString();
    addressData.forEach((element, index) => {
        utils.getTransactionsByAddress(element.address, start, end).then((res) => {
            const temp = [];
            if( res && res?.length ) {
                res.forEach(async(tx, idx) => {
                    const inout = tx.sender === element.address? "OUT" : "IN";
                    if( tx[`payment-transaction`] ) {
                        curAsset = {decimals: 6, unit: "ALGO"};
                    } else {
                        curAsset = AlgoAssets[`${tx[`asset-transfer-transaction`][`asset-id`]}`];
                    }
                    if( curAsset ) {
                        const nickname = element.nickname;
                        const tkname = curAsset.unit;
                        const amt1 = tx[`payment-transaction`]? tx[`payment-transaction`][`amount`] : tx[`asset-transfer-transaction`][`amount`];
                        const dec = parseInt(curAsset.decimals);
                        const divide = Math.pow(10, dec);
                        const amt = (parseInt(amt1)/divide).toFixed(4);

                        if( IsExistTx(temp, tx.id) === 0 ){
                            temp.push(tx.id);
                            const item = `<i>NickName: </i><b>${nickname}</b>\n<i>Token: </i><b>${tkname}</b>\n<i>Qty: </i><b>${amt}(${inout})</b>\n<i>Wallet: </i><i>${element.address}</i>\n<i>DateTime: </i><i>${date}</i>\n<i>Link: </i><a href="${algo_link}${tx.id}">${tx.id}</a>`;
                            bigData1.push({
                                item: item,
                                active: element.active
                            })
                        }
                    }
                    if( idx === res.length - 1 && !timer2 ){
                        sendNotifyByAddr()
                    }
                })
            }
        })
    })
}

function sendNotifyByAddr() {
    timer2 = setInterval(() => {
        if( intervalId1 === bigData1.length || bigData1.length === 0 ) {
            clearInterval(timer2);
            timer2 = null;
            intervalId1 = 0;
            bigData1 = [];
        } else {
            if( bigData1[intervalId1].active ){
                // telegramServices.sendNotificationToHurryUpAlgo(bigData1[intervalId1].item);
            } else {
                // telegramServices.sendNotificationAlgo(bigData1[intervalId1].item);
            }
            intervalId1++;
        }
    }, 2500)
    // body.forEach((item) => {
        // if (active) {
            // telegramServices.sendNotificationToHurryUpAlgo(body);
        // } else {
            // telegramServices.sendNotificationAlgo(body);
        // }
    // })
}


function IsExist(addr) {
    const temp = addressData.filter((item) => item.address === addr)
    return temp.length; 
}

function IsExistTx(arr, curTx) {
    const temp = arr.filter((item) => item === curTx);
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

setInterval(getAssets, 9000);

setInterval(getSystemEvents, 13000);

module.exports = router;
