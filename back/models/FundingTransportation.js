const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FundingTransportation', {
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
    transportation_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'FundingTransportationType',
        key: 'type_id'
      }
    },
    origin: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    destination: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    purpose_of_use: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cargo_list: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    place_validity: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'FundingTransportation',
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
        name: "transportation_type_id",
        using: "BTREE",
        fields: [
          { name: "transportation_type_id" },
        ]
      },
      {
        name: "FundingTransportation_Funding_id_fk",
        using: "BTREE",
        fields: [
          { name: "funding_id" },
        ]
      },
    ]
  });
};
