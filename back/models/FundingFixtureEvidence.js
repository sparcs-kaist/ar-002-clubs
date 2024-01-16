const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FundingFixtureEvidence', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fixture_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'FundingFixture',
        key: 'id'
      }
    },
    funding_fixture_evidence_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'FundingFixtureEvidenceType',
        key: 'type_id'
      }
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'FundingFixtureEvidence',
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
        name: "funding_fixture_evidence_type_id",
        using: "BTREE",
        fields: [
          { name: "funding_fixture_evidence_type_id" },
        ]
      },
      {
        name: "FundingFixtureEvidence_FundingFixture_id_fk",
        using: "BTREE",
        fields: [
          { name: "fixture_id" },
        ]
      },
    ]
  });
};
