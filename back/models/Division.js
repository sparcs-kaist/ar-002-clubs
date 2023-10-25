const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Division', {
    division_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    division_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "division_name"
    },
    division_group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'DivisionGroup',
        key: 'division_group_id'
      }
    }
  }, {
    sequelize,
    tableName: 'Division',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "division_id" },
        ]
      },
      {
        name: "division_name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "division_name" },
        ]
      },
      {
        name: "division_group_id",
        using: "BTREE",
        fields: [
          { name: "division_group_id" },
        ]
      },
    ]
  });
};
