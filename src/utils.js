const axios = require("axios");
const { Algosetting } = require("./models");

const getLatestBlockNumber = () => {
    return new Promise((resolve, reject) => {
        axios.get(`https://algoexplorerapi.io/v1/status`).then((res) => {
            !res? reject(null): resolve(res.data);
        }).catch((err) => {
            reject(err);
        })
    })
}

const updateAlgoSetting = (blockNum) => {
    return new Promise((resolve, reject) => {
        Algosetting.findOne().then((addr) => {
            if(addr) {
                Algosetting.update({
                    start: parseInt(blockNum),
                    end: parseInt(blockNum)
                }, {
                    where: {
                        id: addr.id
                    }
                }).then((updated) => {
                    resolve(true);
                }).catch((err) => {
                    reject(false);
                })
            } else {
                Algosetting.create({
                    start: parseInt(blockNum),
                    end: parseInt(blockNum)
                }).then((added) => {
                    resolve(true);
                })
            }
        }).catch((error) => {
            reject(false);
        });
    })
}

const getTransaction = (qty, start, end) => {
    const url = `https://algoexplorerapi.io/idx2/v2/transactions?currency-greater-than=${qty}&max-round=${end}&min-round=${start}`;
    return new Promise((resolve, reject) => {
        axios.get(url).then((res) => {
            if( res.status === 200 ) {
                resolve(res.data.transactions);
            } else {
                resolve(false);
            }
        }).catch((err) => {
            reject(err);
        })
    })
}

const getTransactionsByAsset = (assetId, qty, start, end) => {
    // const url = `https://algoexplorerapi.io/idx2/v2/assets/${assetId}/transactions?currency-greater-than=${qty}&max-round=${end}&min-round=${start}`;
    const url = `https://algoexplorerapi.io/idx2/v2/transactions?asset-id=${assetId}&currency-greater-than=${qty}&max-round=${end}&min-round=${start}`;
    
    return new Promise((resolve, reject) => {
        axios.get(url).then((res) => {
            if( res.status === 200 ) {
                resolve(res.data.transactions);
            } else {
                resolve(false);
            }
        }).catch((err) => {
            reject(err);
        })
    })
}

const getTransactionsByAddress = (address, start, end) => {
    const url = `https://algoexplorerapi.io/idx2/v2/transactions?address=${address}&currency-greater-than=0&max-round=${end}&min-round=${start}`;
    return new Promise((resolve, reject) => {
        axios.get(url).then((res) => {
            if( res.status === 200 ) {
                resolve(res.data.transactions);
            } else {
                resolve(false);
            }
        }).catch((err) => {
            reject(err);
        })
    })
}

const getAssetOne = (assetId) => {
    const url = `https://algoexplorerapi.io/idx2/v2/assets?asset-id=${assetId}`;
    return new Promise((resolve, reject) => {
        axios.get(url).then((res) => {
            if( res.status === 200 &&  res.data.assets.length ) {
                resolve({
                    decimals: res.data.assets[0].params.decimals,
                    unit: res.data.assets[0].params[`unit-name`]
                });
            } else {
                resolve(false);
            }
        }).catch((err) => {
            reject(err);
        })
    })
}

export const getTopHolders = (page = 0) => {
    return new Promise((resolve, reject) => {
        var data = JSON.stringify({
            "currencyId": 1,
            "row": 100,
            "page": page,
            "order": "desc",
            "order_field": "free"
        });
          
        var config = {
            method: 'post',
            url: 'https://service.eks.centralityapp.com/cennznet-explorer-api/api/scan/accounts',
            headers: { 
                'Content-Type': 'application/json'
            },
            data : data
        };
        
        axios(config).then(function (response) {
            resolve(response.data.data);
        })
        .catch(function (error) {
            reject(error);
        });
    })
}

module.exports = {
    getLatestBlockNumber: getLatestBlockNumber,
    updateAlgoSetting: updateAlgoSetting,
    getTransaction: getTransaction,
    getTransactionsByAsset: getTransactionsByAsset,
    getTransactionsByAddress: getTransactionsByAddress,
    getAssetOne: getAssetOne,
    getTopHolders: getTopHolders,
}

