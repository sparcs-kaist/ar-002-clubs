const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Attendance', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    decision_body_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    member_student_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    attendance_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ClubDivision: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    fromClubId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Club',
        key: 'id'
      }
    },
    fromDivisionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Division',
        key: 'id'
      }
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
          { name: "id" },
        ]
      },
      {
        name: "Attendance_Club_id_fk",
        using: "BTREE",
        fields: [
          { name: "fromClubId" },
        ]
      },
      {
        name: "Attendance_Division_id_fk",
        using: "BTREE",
        fields: [
          { name: "fromDivisionId" },
        ]
      },
    ]
  });
};
