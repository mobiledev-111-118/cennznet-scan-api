module.exports = (sequelize, DataTypes) => {
    const Algoholder = sequelize.define('Algoholder', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nickname: DataTypes.STRING,
        address: DataTypes.STRING,
    }, {});
    Algoholder.associate = function(models) {

    };
    return Algoholder;
}