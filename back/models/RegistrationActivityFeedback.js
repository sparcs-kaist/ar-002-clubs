const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RegistrationActivityFeedback', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    activity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'RegistrationActivity',
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
    added_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'RegistrationActivityFeedback',
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
        name: "ActivityFeedback_Activity_id_fk",
        using: "BTREE",
        fields: [
          { name: "activity" },
        ]
      },
      {
        name: "ActivityFeedback_ExecutiveMember_student_id_fk",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
      {
        name: "ActivityFeedback_Member_student_id_fk",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
    ]
  });
};
