require("@babel/polyfill");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const db = require("./models");
const user = require("./routes/user");
const address = require("./routes/address");
const transaction = require("./routes/transaction");
const setting = require("./routes/setting");

const algoaddress = require("./routes/algoaddress");
const algoasset = require("./routes/algoassets");
const algosetting = require("./routes/algosetting");
const algoholder = require("./routes/algoholder");

const ethersetting = require("./routes/ethersetting");

const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'pug');

app.use('/user', user);
app.use('/address', address);
app.use('/transaction', transaction);
app.use('/setting', setting);

app.use('/algo_address', algoaddress);
app.use('/algo_asset', algoasset);
app.use('/algo_setting', algosetting);
app.use('/algo_holder', algoholder);

app.use('/ethersetting', ethersetting);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
  
app.use((err, req, res, next) => {
    res.locals.error = err;
    const status = err.status || 500;
    res.status(status);
    res.render('error');
});

db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
})
