const request = require("request");
const { TELE_BOT_TOKEN, TELE_GROUP_ID } = require("./config/urls");

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

module.exports = {
    sendNotification: sendNotification,
}