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
        from: DataTypes.STRING,
        to: DataTypes.STRING,
        qty: DataTypes.INTEGER,
        decimal: DataTypes.INTEGER,
        tkname: DataTypes.STRING,
        timeline: DataTypes.INTEGER
    }, {});
    Transaction.associate = function(models) {

    };
    return Transaction;
}