const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ActivitySign', {
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Semester',
        key: 'id'
      }
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Club',
        key: 'id'
      }
    },
    sign_time: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'ActivitySign',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "club_id" },
          { name: "semester_id" },
          { name: "sign_time" },
        ]
      },
      {
        name: "ActivitySign_Semester_id_fk",
        using: "BTREE",
        fields: [
          { name: "semester_id" },
        ]
      },
    ]
  });
};
