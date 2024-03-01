const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SemesterClub', {
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Club',
        key: 'id'
      }
    },
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Semester',
        key: 'id'
      }
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'SemesterClubType',
        key: 'id'
      }
    },
    characteristic_kr: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    characteristic_en: {
      type: DataTypes.TEXT,
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
          { name: "semester_id" },
        ]
      },
      {
        name: "semester_id",
        using: "BTREE",
        fields: [
          { name: "semester_id" },
        ]
      },
      {
        name: "type_id",
        using: "BTREE",
        fields: [
          { name: "type_id" },
        ]
      },
    ]
  });
};
