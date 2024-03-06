const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('RegistrationFeedback', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    registration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Registration',
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
    tableName: 'RegistrationFeedback',
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
        name: "RegistrationFeedback_Activity_id_fk",
        using: "BTREE",
        fields: [
          { name: "registration" },
        ]
      },
      {
        name: "RegistrationFeedback_Member_student_id_fk",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
    ]
  });
};
