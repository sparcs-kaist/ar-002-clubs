const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RegistrationMember', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Semester',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Member',
        key: 'student_id'
      }
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SemesterClub',
        key: 'club_id'
      }
    },
    approved_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    apply_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    approve_time: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'RegistrationMember',
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
        name: "RegistrationMember_pk2",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "club_id" },
          { name: "student_id" },
          { name: "approved_type" },
          { name: "semester_id" },
        ]
      },
      {
        name: "RegistrationMember_MemberStatus_semester_id_student_id_fk",
        using: "BTREE",
        fields: [
          { name: "semester_id" },
          { name: "student_id" },
        ]
      },
      {
        name: "RegistrationMember_Member_student_id_fk",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
      {
        name: "RegistrationMember_SemesterClub_semester_id_club_id_fk",
        using: "BTREE",
        fields: [
          { name: "semester_id" },
          { name: "club_id" },
        ]
      },
    ]
  });
};
