const express = require("express");
const { Transaction, Address, Setting } = require("../models");
const router = express.Router();

const { Api } = require('@cennznet/api');
const { endpoint, link, Assets, Decimal } = require("../config/urls");

const telegramServices = require("../telegramServices");
const sendNotificationToLimited = require("../telegramServices");
const sendNotificationToHurryUp = require("../telegramServices");

let assetData = null;

function getSetting() {
    try {
        Transaction.findAll().then((res) => {
            if(res) {
                assetData = res;
            }
        })
    } catch (e) {
        console.log("err in getting setting data :: ", e)
    }
    
}
async function getSystemEvents() {
    try{
        const api = await Api.create({
            provider: endpoint
        });
        if( api ) {
            console.log("Connected!");
            api.query.system.events((events) => {
                if( events.length > 1 ){
                    events.forEach(async (record, idx) => {
                        const { event, phase } = record;

                        if( event.method.toLocaleLowerCase() === "transferred" ){
                            let temp = {
                                id: event.data[0].toString(),
                                from: event.data[1].toString(),
                                to: event.data[2].toString(),
                                amt: event.data[3]
                            };
                            await processTransData(temp);
                        }
                    });
                }
            })
        } else {
            console.log("Cannot connect to CENNZnet!");
        }
    } catch(error) {
        console.log(error)
        setTimeout(getSystemEvents, 2000);
    }
    
}

async function processTransData(data) {
    const fromOne = await IsExist(data.from);
    const toOne = await IsExist(data.to);
    const today = new Date();
    const date = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate() + ' ';
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    const amt = (parseInt(data.amt)/10000).toFixed(4);
    const currentAsset1 = assetData.filter((_i) => _i.dataValues.address === data.id.replace(',',''));
    let currentAsset = null;
    if( currentAsset1.length > 0 ) {
        currentAsset = currentAsset1[0].dataValues;
    }

    if( fromOne ) {
        const body = `<b>Wallet: </b><i>${data.from}</i>\n<b>NickName: </b><i>${fromOne.nickname}</i>\n<b>Qty: </b><i>${amt}</i>\n<b>DateTime: </b><i>${date}${time}</i>\n<b>Link: </b><a href="${link}${data.from}">${data.from}</a>`;
        if( fromOne.active ) {
            sendNotificationToHurryUp(body);
        } else {
            if( !currentAsset ){
                telegramServices.sendNotification(body);
            } else if(parseInt(currentAsset.qty) < parseInt(data.amt)) {
                telegramServices.sendNotification(body);
            } else {
                sendNotificationToLimited(body);
            }
        }
    } else if( toOne ) {
        const body = `<b>Wallet: </b><i>${data.to}</i>\n<b>NickName: </b><i>${toOne.nickname}</i>\n<b>Qty: </b><i>${amt}</i>\n<b>DateTime: </b><i>${date}${time}</i>\n<b>Link: </b><a href="${link}${data.to}">${data.to}</a>`
        if( toOne.active ) {
            sendNotificationToHurryUp(body);
        } else {
            if( !currentAsset ){
                telegramServices.sendNotification(body);
            } else if(parseInt(currentAsset.qty) < parseInt(data.amt)) {
                telegramServices.sendNotification(body);
            } else {
                sendNotificationToLimited(body);
            }
        }
    } else {
        const tkname = currentAsset === null? Assets[(`${data.id}`).replace(',', '')]: currentAsset.tkname;
        const body = `<b>Token: </b><i>${tkname}</i>\n<b>Qty: </b><i>${amt}</i>\n<b>DateTime: </b><i>${date}${time}</i>\n<b>Link: </b><a href="${link}${data.from}">${data.from}</a>`
        if( !currentAsset ){
            telegramServices.sendNotification(body);
        } else if(parseInt(currentAsset.qty) < parseInt(data.amt)) {
            telegramServices.sendNotification(body);
        } else {
            sendNotificationToLimited(body);
        }
    }
}

function IsExist(addr) {
    return Address.findOne({
        where: {
            address: addr
        }
    }).then((res) => {
        if( res ) {
            console.log(res)
            return res;
        } else {
            return null;
        }
    }).catch((err) => {
        return null;
    })
}

router.get("/get/:uid", async (req, res) => {
    
    Transaction.findAll({
        where: {
            userid: parseInt(req.params.uid)
        }
    }).then((data) => {
        if(data) {
            res.json({success: true, result: data});
        } else {
            res.json({success: false, result: []});
        }
    }).catch((error) => {
        res.json({success: false, resulte: error})
    });
});

router.get("/delete/:id", (req, res) => {
    Transaction.destroy({
        where: {
            id: parseInt(req.params.id)
        }
    }).then((addr) => {
            res.json({success: true, result: {id: req.params.id}});
    }).catch((error) => {
        res.status(error.statusCode).send(error.message);
    });
});


router.post("/add", (req, res) => {
    Transaction.findOne({
        where: {
            address: req.body.address
        }
    }).then((addr) => {
        if(addr) {
            res.json({ success: false, msg: "This asset already is being tracking!"});
        } else {
            Transaction.create({
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
        res.status(error.statusCode).send(error.message);
    });
});

router.post("/update", (req, res) => {
    Transaction.update({
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
        res.status(error.statusCode).send(error.message);
    });
});

setInterval(getSetting, 5000);

setTimeout(getSystemEvents, 8000);

module.exports = router;
