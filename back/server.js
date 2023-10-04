const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 80;

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',      // 로컬 MySQL 사용자 이름. 필요에 따라 수정하세요.
//   password: 'password',  // 비밀번호. 수정하세요.
//   database: 'testdb'     // 사용할 DB명. 필요에 따라 수정하세요.
// });

app.get('/api/data', (req, res) => {
  db.query('SELECT * FROM sample_table', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});