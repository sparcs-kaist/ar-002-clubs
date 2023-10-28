const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Funding', {
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    allocated_amount: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: false
    },
    final_amount: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Funding',
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
    ]
  });
};
