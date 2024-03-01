const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ActivityFeedbackExecutive', {
    activity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Activity',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ExecutiveMember',
        key: 'student_id'
      }
    }
  }, {
    sequelize,
    tableName: 'ActivityFeedbackExecutive',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "activity" },
        ]
      },
      {
        name: "ActivityFeedbackExecutive_ExecutiveMember_student_id_fk",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
    ]
  });
};
