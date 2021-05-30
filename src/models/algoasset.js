module.exports = (sequelize, DataTypes) => {
    const Algoasset = sequelize.define('Algoasset', {
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
    Algoasset.associate = function(models) {

    };
    return Algoasset;
}