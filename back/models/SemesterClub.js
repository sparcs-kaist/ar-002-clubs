const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SemesterClub', {
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Club',
        key: 'club_id'
      }
    },
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'SemesterActivity',
        key: 'activity_id'
      }
    },
    president_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Member',
        key: 'student_id'
      }
    },
    vice_president_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Member',
        key: 'student_id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_permanent: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    room_location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    room_password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    advisor: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'SemesterClub',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "club_id" },
          { name: "activity_id" },
        ]
      },
      {
        name: "activity_id",
        using: "BTREE",
        fields: [
          { name: "activity_id" },
        ]
      },
      {
        name: "president_id",
        using: "BTREE",
        fields: [
          { name: "president_id" },
        ]
      },
      {
        name: "vice_president_id",
        using: "BTREE",
        fields: [
          { name: "vice_president_id" },
        ]
      },
    ]
  });
};
