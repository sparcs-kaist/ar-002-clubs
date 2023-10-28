const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Member', {
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: "uid"
    },
    kaist_uid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: "kaist_uid"
    },
    sparcs_uid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: "sparcs_uid"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone_number: {
      type: DataTypes.STRING(255),
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
    }
  }, {
    sequelize,
    tableName: 'Member',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
      {
        name: "uid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uid" },
        ]
      },
      {
        name: "kaist_uid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "kaist_uid" },
        ]
      },
      {
        name: "sparcs_uid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sparcs_uid" },
        ]
      },
    ]
  });
};
