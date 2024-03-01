const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Club', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "name"
    },
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Division',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    founding_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bank: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    account_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    account_holder: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    building_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ClubBuilding',
        key: 'id'
      }
    },
    room_location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    room_password: {
      type: DataTypes.STRING(255),
      allowNull: true
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
          { name: "id" },
        ]
      },
      {
        name: "name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "division_id",
        using: "BTREE",
        fields: [
          { name: "division_id" },
        ]
      },
      {
        name: "building_id",
        using: "BTREE",
        fields: [
          { name: "building_id" },
        ]
      },
    ]
  });
};
