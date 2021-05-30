module.exports = (sequelize, DataTypes) => {
    const Algosetting = sequelize.define('Algosetting', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        start: DataTypes.INTEGER,
        end: DataTypes.INTEGER,
    }, {});
    Algosetting.associate = function(models) {

    };
    return Algosetting;
}