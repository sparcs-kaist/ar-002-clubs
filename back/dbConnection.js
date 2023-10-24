const mysql = require('mysql2');
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'pbc',
  password: '1017',
  database: 'kaist_clubs'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected!');
});

module.exports = db;
