module.exports = (sequelize, DataTypes) => {
    const CoinSetting = sequelize.define('CoinSetting', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        minPrice: DataTypes.INTEGER,
        maxPrice: DataTypes.INTEGER,
        coin: DataTypes.STRING,
    }, {});
    CoinSetting.associate = function(models) {

    };
    return CoinSetting;
}