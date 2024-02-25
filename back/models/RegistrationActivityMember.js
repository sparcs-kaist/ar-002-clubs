const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RegistrationActivityMember', {
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'RegistrationActivity',
        key: 'id'
      }
    },
    member_student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Member',
        key: 'student_id'
      }
    }
  }, {
    sequelize,
    tableName: 'RegistrationActivityMember',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "activity_id" },
          { name: "member_student_id" },
        ]
      },
      {
        name: "ActivityMember_Member_student_id_fk_2",
        using: "BTREE",
        fields: [
          { name: "member_student_id" },
        ]
      },
    ]
  });
};
