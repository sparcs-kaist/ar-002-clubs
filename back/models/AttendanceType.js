const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('AttendanceType', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "status"
    }
  }, {
    sequelize,
    tableName: 'AttendanceType',
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
        name: "status",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
};
