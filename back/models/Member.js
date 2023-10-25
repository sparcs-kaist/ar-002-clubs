const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Member', {
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    kaist_uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      allowNull: false,
      unique: "email"
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING(15),
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
        name: "kaist_uid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "kaist_uid" },
        ]
      },
      {
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
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
