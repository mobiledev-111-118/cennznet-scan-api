const express = require("express");
const { Transaction, Address, Setting } = require("../models");
const router = express.Router();

const { Api } = require('@cennznet/api');
const { endpoint, link, Assets, Decimal } = require("../config/urls");
const telegramServices = require("../telegramServices");


let amtLimit = 500;

function getSetting() {
    try {
        Setting.findOne().then((res) => {
            if(res) {
                amtLimit = parseInt(res.limit);
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
                        // const types = event.typeDef;
                        // console.log("event data :: ", JSON.stringify(event.data))
                        if( event.method.toLocaleLowerCase() === "transferred" ){
                            let temp = {
                                id: event.data[0].toString(),
                                from: event.data[1].toString(),
                                to: event.data[2].toString(),
                                amt: event.data[3]
                            };
                            // console.log(JSON.stringify(temp), "<==== transaction data");
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
    const timestamp = today.getTime();

    const amt = (parseInt(data.amt)/10000).toFixed(4);
    
    if( fromOne ) {
        const body = `<b>Wallet: </b><i>${data.from}</i>\n<b>NickName: </b><i>${fromOne.nickname}</i>\n<b>DateTime: </b><i>${date}${time}</i>\n<b>Link: </b><a href="${link}${data.from}">${data.from}</a>`
        await telegramServices.sendNotification(body);
        Transaction.create({
            userid: parseInt(fromOne.userid),
            nickname: fromOne.nickname,
            address: fromOne.address,
            fromaddr: data.from,
            toaddr: data.to,
            qty: parseInt(data.amt),
            tkdecimal: Decimal[`${data.id}`],
            tkname: Assets[`${data.id}`],
            timeline: timestamp,
        }).then((res) => {
        }).catch((err) =>{});
    } else if( toOne ) {
        const body = `<b>Wallet: </b><i>${data.to}</i>\n<b>NickName: </b><i>${toOne.nickname}</i>\n<b>DateTime: </b><i>${date}${time}</i>\n<b>Link: </b><a href="${link}${data.from}">${data.from}</a>`
        await telegramServices.sendNotification(body);
        Transaction.create({
            userid: parseInt(toOne.userid),
            nickname: toOne.nickname,
            address: toOne.address,
            fromaddr: data.from,
            toaddr: data.to,
            qty: parseInt(data.amt),
            tkdecimal: Decimal[`${data.id}`],
            tkname: Assets[`${data.id}`],
            timeline: timestamp,
        }).then((res) => {
        }).catch((err) =>{});
    } else {

        if( amtLimit <= parseInt(data.amt) ) {
            const body = `<b>Token: </b><i>${Assets[`${data.id}`]}</i>\n<b>Qty: </b><i>${amt}</i>\n<b>DateTime: </b><i>${date}${time}</i>\n<b>Link: </b><a href="${link}${data.from}">${data.from}</a>`
            await telegramServices.sendNotification(body);
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

setInterval(getSetting, 5000);

setTimeout(getSystemEvents, 8000);

module.exports = router;
