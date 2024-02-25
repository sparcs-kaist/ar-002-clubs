const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RegistrationSign', {
    registration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Registration',
        key: 'id'
      }
    },
    sign_type: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sign_time: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'RegistrationSign',
    timestamps: false,
    indexes: [
      {
        name: "RegistrationSign_Registration_id_fk",
        using: "BTREE",
        fields: [
          { name: "registration" },
        ]
      },
    ]
  });
};
