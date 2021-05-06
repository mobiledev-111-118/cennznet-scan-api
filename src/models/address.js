module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('Address', {
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
    Address.associate = function(models) {

    };
    return Address;
}