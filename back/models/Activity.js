const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Activity', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    activity_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ActivityType',
        key: 'id'
      }
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    feedback_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ActivityFeedbackType',
        key: 'id'
      }
    },
    recent_edit: {
      type: DataTypes.DATE,
      allowNull: true
    },
    recent_feedback: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Activity',
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
        name: "Activity_ActivityFeedbackType_id_fk",
        using: "BTREE",
        fields: [
          { name: "feedback_type" },
        ]
      },
      {
        name: "Activity_ActivityType_id_fk",
        using: "BTREE",
        fields: [
          { name: "activity_type_id" },
        ]
      },
    ]
  });
};
