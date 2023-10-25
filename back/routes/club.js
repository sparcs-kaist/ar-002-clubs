const express = require('express');
const router = express.Router();
// const db = require('../utils/dbConnection'); // 데이터베이스 연결 불러오기

router.get('/', (req, res) => {
  db.query('SELECT * FROM divisiongroup', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

module.exports = router;
