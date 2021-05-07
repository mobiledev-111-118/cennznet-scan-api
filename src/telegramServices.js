const request = require("request");
const { TELE_BOT_TOKEN, TELE_GROUP_ID, HURRYUP_BOT_TOKEN, HURRYUP_CHAT_ID, LIMIT_BOT_TOKEN, LIMIT_CHAT_ID } = require("./config/urls");

const sendNotification = (body) => {

    return new Promise((resolve, reject) => {
        try {
            let data = {
                chat_id: `${TELE_GROUP_ID}`,
                parse_mode: "HTML",
                text: body
            };
            request({
                uri: `https://api.telegram.org/bot${TELE_BOT_TOKEN}/sendMessage`,
                method: "POST",
                json: data
            }, function(err, res, bdy){
                if( !err ) {
                    resolve("Done!");
                } else {
                    console.log(err);
                    reject(err);
                }
            })
        } catch(e) {
            reject(e);
        }
    })
};

const sendNotificationToHurryUp = (body) => {
    return new Promise((resolve, reject) => {
        try {
            let data = {
                chat_id: `${HURRYUP_CHAT_ID}`,
                parse_mode: "HTML",
                text: body
            };
            request({
                uri: `https://api.telegram.org/bot${HURRYUP_BOT_TOKEN}/sendMessage`,
                method: "POST",
                json: data
            }, function(err, res, bdy){
                if( !err ) {
                    resolve("Done!");
                } else {
                    console.log(err);
                    reject(err);
                }
            })
        } catch(e) {
            reject(e);
        }
    })
};

const sendNotificationToLimited = (body) => {

    return new Promise((resolve, reject) => {
        try {
            let data = {
                chat_id: `${LIMIT_CHAT_ID}`,
                parse_mode: "HTML",
                text: body
            };
            request({
                uri: `https://api.telegram.org/bot${LIMIT_BOT_TOKEN}/sendMessage`,
                method: "POST",
                json: data
            }, function(err, res, bdy){
                if( !err ) {
                    resolve("Done!");
                } else {
                    console.log(err);
                    reject(err);
                }
            })
        } catch(e) {
            reject(e);
        }
    })
};

module.exports = {
    sendNotification: sendNotification,
    sendNotificationToHurryUp: sendNotificationToHurryUp,
    sendNotificationToLimited: sendNotificationToLimited,
}