const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Club', {
    club_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    club_name_kor: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "club_name_kor"
    },
    club_name_eng: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "club_name_eng"
    },
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Division',
        key: 'division_id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    founding_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Club',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "club_id" },
        ]
      },
      {
        name: "club_name_kor",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "club_name_kor" },
        ]
      },
      {
        name: "club_name_eng",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "club_name_eng" },
        ]
      },
      {
        name: "division_id",
        using: "BTREE",
        fields: [
          { name: "division_id" },
        ]
      },
    ]
  });
};
