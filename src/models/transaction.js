module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userid: DataTypes.INTEGER,
        nickname: DataTypes.STRING,
        address: DataTypes.STRING,
        qty: DataTypes.INTEGER,
        tkdecimal: DataTypes.INTEGER,
        tkname: DataTypes.STRING,
    }, {});
    Transaction.associate = function(models) {

    };
    return Transaction;
}