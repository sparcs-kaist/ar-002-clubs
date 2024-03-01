const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RegistrationEvidence', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    registration_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Registration',
        key: 'id'
      }
    },
    registration_evidence_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'RegistrationEvidenceType',
        key: 'type_id'
      }
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'RegistrationEvidence',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "RegistrationEvidence_RegistrationEvidenceType_type_id_fk",
        using: "BTREE",
        fields: [
          { name: "registration_evidence_type" },
        ]
      },
      {
        name: "RegistrationEvidence_Registration_id_fk",
        using: "BTREE",
        fields: [
          { name: "registration_id" },
        ]
      },
    ]
  });
};
