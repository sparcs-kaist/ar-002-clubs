const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RegistrationSignType', {
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    registration_sign_type: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'RegistrationSignType',
    timestamps: false
  });
};
