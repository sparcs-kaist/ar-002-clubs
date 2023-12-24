const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ExecutiveMember', {
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Member',
        key: 'student_id'
      }
    },
    main_bureau: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'ExecutiveBureau',
        key: 'bureau_id'
      }
    },
    sub_bureau: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ExecutiveBureau',
        key: 'bureau_id'
      }
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'ExecutiveType',
        key: 'type_id'
      }
    },
    start_term: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      primaryKey: true
    },
    end_term: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    is_admin: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ExecutiveMember',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "student_id" },
          { name: "start_term" },
          { name: "type_id" },
          { name: "main_bureau" },
        ]
      },
      {
        name: "ExecutiveMember_ExecutiveBureau_bureau_id_fk",
        using: "BTREE",
        fields: [
          { name: "main_bureau" },
        ]
      },
      {
        name: "ExecutiveMember_ExecutiveBureau_bureau_id_fk2",
        using: "BTREE",
        fields: [
          { name: "sub_bureau" },
        ]
      },
      {
        name: "ExecutiveMember___fk",
        using: "BTREE",
        fields: [
          { name: "type_id" },
        ]
      },
    ]
  });
};
