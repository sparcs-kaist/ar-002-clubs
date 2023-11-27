const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Meeting', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'MeetingType',
        key: 'id'
      }
    },
    meeting_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    MeetingRecord: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isRegular: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    divisionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Division',
        key: 'id'
      }
    },
    editorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Member',
        key: 'student_id'
      }
    }
  }, {
    sequelize,
    tableName: 'Meeting',
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
        name: "Meeting_pk",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "editorId" },
          { name: "meeting_date" },
          { name: "type_id" },
        ]
      },
      {
        name: "type_id",
        using: "BTREE",
        fields: [
          { name: "type_id" },
        ]
      },
      {
        name: "Meeting_Division_id_fk",
        using: "BTREE",
        fields: [
          { name: "divisionId" },
        ]
      },
      {
        name: "Meeting_Member_student_id_fk",
        using: "BTREE",
        fields: [
          { name: "editorId" },
        ]
      },
    ]
  });
};
