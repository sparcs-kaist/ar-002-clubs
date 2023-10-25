const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DivisionGroup', {
    division_group_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    division_group_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "division_group_name"
    }
  }, {
    sequelize,
    tableName: 'DivisionGroup',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "division_group_id" },
        ]
      },
      {
        name: "division_group_name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "division_group_name" },
        ]
      },
    ]
  });
};
