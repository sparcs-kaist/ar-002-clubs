const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ExecutiveBureau', {
    bureau_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bureau_name: {
      type: DataTypes.STRING(31),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ExecutiveBureau',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bureau_id" },
        ]
      },
    ]
  });
};
