const dotenv = require('dotenv');

dotenv.config();

const config = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'kaist_clubs',
    host: process.env.DB_HOST,
    dialect: 'mysql',
    define: {
      timestamps: false,
    },
  };
  
module.exports = config;