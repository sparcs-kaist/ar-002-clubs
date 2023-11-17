const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('MemberStatus', {
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Member',
        key: 'student_id'
      }
    },
    is_regular_member: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Semester',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'MemberStatus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "student_id" },
          { name: "semester_id" },
        ]
      },
      {
        name: "semester_id",
        using: "BTREE",
        fields: [
          { name: "semester_id" },
        ]
      },
    ]
  });
};
