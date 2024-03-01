const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RegistrationActivityEvidence', {
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'RegistrationActivity',
        key: 'id'
      }
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(511),
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'RegistrationActivityEvidence',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "description" },
          { name: "activity_id" },
        ]
      },
      {
        name: "RegistrationActivityEvidence_RegistrationActivity_id_fk",
        using: "BTREE",
        fields: [
          { name: "activity_id" },
        ]
      },
    ]
  });
};
