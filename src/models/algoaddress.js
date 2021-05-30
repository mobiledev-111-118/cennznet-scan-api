module.exports = (sequelize, DataTypes) => {
    const Algoaddress = sequelize.define('Algoaddress', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userid: DataTypes.INTEGER,
        nickname: DataTypes.STRING,
        address: DataTypes.STRING,
        active: DataTypes.TINYINT(1)
    }, {});
    Algoaddress.associate = function(models) {

    };
    return Algoaddress;
}