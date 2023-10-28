const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('MeetingMemberType', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    position: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "position"
    }
  }, {
    sequelize,
    tableName: 'MeetingMemberType',
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
        name: "position",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "position" },
        ]
      },
    ]
  });
};
