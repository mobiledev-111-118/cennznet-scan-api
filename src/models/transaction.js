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
        fromaddr: DataTypes.STRING,
        toaddr: DataTypes.STRING,
        qty: DataTypes.INTEGER,
        tkdecimal: DataTypes.INTEGER,
        tkname: DataTypes.STRING,
        timeline: DataTypes.INTEGER
    }, {});
    Transaction.associate = function(models) {

    };
    return Transaction;
}