const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FundingEvidence', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    funding_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Funding',
        key: 'id'
      }
    },
    funding_evidence_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'FundingEvidenceType',
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
    tableName: 'FundingEvidence',
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
        name: "funding_evidence_type_id",
        using: "BTREE",
        fields: [
          { name: "funding_evidence_type_id" },
        ]
      },
      {
        name: "FundingEvidence_Funding_id_fk",
        using: "BTREE",
        fields: [
          { name: "funding_id" },
        ]
      },
    ]
  });
};
