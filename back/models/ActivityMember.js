const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ActivityMember', {
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
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
    tableName: 'ActivityMember',
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
        name: "ActivityMember_Member_student_id_fk",
        using: "BTREE",
        fields: [
          { name: "member_student_id" },
        ]
      },
    ]
  });
};
