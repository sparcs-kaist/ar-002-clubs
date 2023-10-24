const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // 회의 관련 코드 작성
    res.send('Meeting data');
});

module.exports = router;
