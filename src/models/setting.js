module.exports = (sequelize, DataTypes) => {
    const Setting = sequelize.define('Setting', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        limit: DataTypes.INTEGER,
        start: DataTypes.INTEGER,
        end: DataTypes.INTEGER,
    }, {});
    Setting.associate = function(models) {

    };
    return Setting;
}