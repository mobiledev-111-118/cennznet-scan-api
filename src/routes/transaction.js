const express = require("express");
const { Transaction, Address } = require("../models");
const router = express.Router();

const { Api } = require('@cennznet/api');
const { endpoint, link, Assets } = require("../config/urls");

const telegramServices = require("../telegramServices");

let assetData = null;

const CENNZ_ID = 1;
const CPAY_ID = 2;

let cennzPrevAmt = 0;
let cpayPrevAmt = 0;

async function getBalanceStatus() {
    const api = await Api.create({
        provider: endpoint
    });
    // query and supplement liquidity
    if (api){
        const [poolAssetBalance, poolAssetBalanceCPAY] = [
            await api.derive.cennzx.poolAssetBalance(CENNZ_ID),
            await api.derive.cennzx.poolCoreAssetBalance(CENNZ_ID),
        ];

        const cennzAmt = parseInt(poolAssetBalance.toString())/10000;
        const cpayAmt = parseInt(poolAssetBalanceCPAY.toString())/10000;

        if (cennzPrevAmt === 0 || cpayPrevAmt === 0) {
            cennzPrevAmt = cennzAmt;
            cpayPrevAmt = cpayAmt;
        } else if(cennzPrevAmt - cennzAmt !== 0){
            const cennzDiff = cennzPrevAmt - cennzAmt;
            const cpayDiff = cpayPrevAmt - cpayAmt;
            const today = new Date();
            const date = today.toUTCString();
            let body = '';
            if (cennzDiff > 0 && cpayDiff < 0){
                body = `<b>${Math.abs(cpayDiff)} CPAY sold for ${cennzDiff} CENNZ.</b>\n<b>${date}</b>`;
            }
            if (cennzDiff < 0 && cpayDiff > 0) {
                body = `<b>${cpayDiff} CPAY bought for ${Math.abs(cennzDiff)} CENNZ.</b>\n<b>${date}</b>`;
            }

            if (body !== ''){
                telegramServices.sendNotificationCennzX(body);
                cennzPrevAmt = cennzAmt;
                cpayPrevAmt = cpayAmt;
            }
        }

    }
}

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
                        const { event } = record;

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

            // await getBalanceStatue(api);

        } else {
            console.log("Cannot connect to CENNZnet!");
            setTimeout(getSystemEvents, 2000);
        }
    } catch(error) {
        setTimeout(getSystemEvents, 2000);
    }
}

async function processTransData(data) {
    const fromOne = await IsExist(data.from);
    const toOne = await IsExist(data.to);
    const today = new Date();
    const date = today.toUTCString();

    const amt = (parseInt(data.amt) / 10000).toFixed(4);
    const currentAsset1 = assetData.filter((_i) => _i.dataValues.address === data.id.replace(',', ''));
    let currentAsset = null;
    if (currentAsset1.length > 0) {
        currentAsset = currentAsset1[0].dataValues;
    }

    const tkname = currentAsset === null ? Assets[`${data.id}`.replace(',', '')] : currentAsset.tkname;
    if (fromOne) {
        const body = `<i>NickName: </i><b>${fromOne.dataValues.nickname}</b>\n<i>Token: </i><b>${tkname}</b>\n<i>Qty: </i><b>${amt}(OUT)</b>\n<i>Wallet: </i><i>${data.from}</i>\n<i>DateTime: </i><i>${date}</i>\n<i>Link: </i><a href="${link}${data.from}">${data.from}</a>`;
        if (fromOne.dataValues.active) {
            telegramServices.sendNotificationToHurryUp(body);
        } else {
            telegramServices.sendNotification(body);
        }
    } else if (toOne) {
        const body = `<i>NickName: </i><b>${toOne.dataValues.nickname}</b>\n<i>Token: </i><b>${tkname}</b>\n<i>Qty: </i><b>${amt}(IN)</b>\n<i>Wallet: </i><i>${data.to}</i>\n<i>DateTime: </i><i>${date}</i>\n<i>Link: </i><a href="${link}${data.to}">${data.to}</a>`;
        if (toOne.dataValues.active) {
            telegramServices.sendNotificationToHurryUp(body);
        } else {
            telegramServices.sendNotification(body);
        }
    } else if (currentAsset) {
        const body = `<i>Token: </i><b>${tkname}</b>\n<i>Qty: </i><b>${amt}</b>\n<i>DateTime: </i><i>${date}</i>\n<i>Link: </i><a href="${link}${data.from}">${data.from}</a>`;
        if (parseInt(currentAsset.qty) !== 0 && parseInt(currentAsset.qty) * 10000 <= parseInt(data.amt)) {
            telegramServices.sendNotificationToLimited(body);
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
            return res;
        } else {
            return null;
        }
    }).catch((err) => {
        return null;
    })
}

router.get("/get/:uid", async (req, res) => {
    Transaction.findAll().then((data) => {
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
    Transaction.destroy({
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
        res.json({ success: false, msg: error.message});
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
        res.json({ success: false, msg: error.message});
    });
});

router.get("/test", (req, res) =>{
    // const body = `<i>Wallet: </i><i>5E6okk5DSQTdkxqMo9b66BmmWCYfU3XdWcxhP65382Pt32Ug</i>\n<i>NickName: </i><b>Test</b>\n<i>Token: </i><b>CPAY</b>\n<i>Qty: </i><b>1000.000</b>\n<i>DateTime: </i><i>date</i>\n<i>Link: </i><a href="https://google.com">5E6okk5DSQTdkxqMo9b66BmmWCYfU3XdWcxhP65382Pt32Ug</a>`;
    // telegramServices.sendNotificationToHurryUp(body)
    const today = new Date();
    const date = today.toUTCString();
    res.json({success: true, date});
});

setInterval(getSetting, 5000);

setTimeout(getSystemEvents, 8000);

setInterval(getBalanceStatus, 10000);

module.exports = router;
