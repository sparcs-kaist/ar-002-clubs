const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FundingNoncorp', {
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
    trader_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    trader_account_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    waste_explanation: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'FundingNoncorp',
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
        name: "FundingNoncorp_Funding_id_fk",
        using: "BTREE",
        fields: [
          { name: "funding_id" },
        ]
      },
    ]
  });
};
