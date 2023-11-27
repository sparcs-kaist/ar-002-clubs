const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Agenda', {
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
    agenda_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    decision_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    total_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pros_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cons_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    giveup_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Agenda',
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
    ]
  });
};
