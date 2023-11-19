const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config');
const initModels = require('./init-models');
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const models = initModels(sequelize);
Object.assign(db, models);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;