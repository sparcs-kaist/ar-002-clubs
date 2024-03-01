const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FundingFixture', {
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
    funding_fixture_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'FundingFixtureType',
        key: 'type_id'
      }
    },
    fixture_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fixture_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'FundingFixtureObjectType',
        key: 'type_id'
      }
    },
    usage_purpose: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_software: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    software_proof_text: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'FundingFixture',
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
        name: "funding_fixture_type_id",
        using: "BTREE",
        fields: [
          { name: "funding_fixture_type_id" },
        ]
      },
      {
        name: "fixture_type_id",
        using: "BTREE",
        fields: [
          { name: "fixture_type_id" },
        ]
      },
      {
        name: "FundingFixture_Funding_id_fk",
        using: "BTREE",
        fields: [
          { name: "funding_id" },
        ]
      },
    ]
  });
};
