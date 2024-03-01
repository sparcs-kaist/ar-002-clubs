const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('MemberClub', {
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Member',
        key: 'student_id'
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
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'MemberStatus',
        key: 'semester_id'
      }
    }
  }, {
    sequelize,
    tableName: 'MemberClub',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "student_id" },
          { name: "club_id" },
          { name: "semester_id" },
        ]
      },
      {
        name: "club_id",
        using: "BTREE",
        fields: [
          { name: "club_id" },
        ]
      },
      {
        name: "semester_id",
        using: "BTREE",
        fields: [
          { name: "semester_id" },
        ]
      },
      {
        name: "MemberClub_MemberStatus_student_id_semester_id_fk",
        using: "BTREE",
        fields: [
          { name: "student_id" },
          { name: "semester_id" },
        ]
      },
    ]
  });
};
