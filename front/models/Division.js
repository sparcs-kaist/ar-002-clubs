const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Division', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    division_group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'DivisionGroup',
        key: 'id'
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
          { name: "id" },
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
