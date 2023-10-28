const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Attendance', {
    decision_body_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    member_student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    attendance_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Attendance',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "decision_body_id" },
          { name: "member_student_id" },
        ]
      },
    ]
  });
};
