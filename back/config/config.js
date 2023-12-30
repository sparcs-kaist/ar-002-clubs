const dotenv = require("dotenv");

dotenv.config();

const config = {
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
  logging: false,
  define: {
    timestamps: false,
  },
};

module.exports = config;
