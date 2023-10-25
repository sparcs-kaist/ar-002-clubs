const express = require('express');
const router = express.Router();
const session = require('express-session');
require('dotenv').config();
const Client = require('../utils/sparcssso');


const clientId = process.env.SSO_CLIENT_ID;
const secretKey = process.env.SSO_SECRET_KEY;
const client = new Client(clientId, secretKey);

router.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true
}));

router.get('/login', (req, res) => {
  const { url, state } = client.getLoginParams();
  req.session.state = state;
  
  // 클라이언트에게 SPARCS SSO 로그인 URL 응답으로 보내기
  res.json({ loginUrl: url });
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  const { state } = req.session;

  try {
    const userInfo = await client.getUserInfo(code, state);
    console.log(userInfo);
    req.session.user = userInfo;
    
    // 사용자 정보를 query parameter로 추가하여 클라이언트로 리다이렉트
    res.redirect(`http://127.0.0.1:3000/?userInfo=${JSON.stringify(userInfo)}`);
  } catch (error) {
    res.send('Error: ' + error.message);
  }
});

router.get('/logout', (req, res) => {
  const userIdFromQuery = req.query.userId; // 쿼리 파라미터에서 userId 값을 가져옵니다.

  if (req.query.userId) {
    const logoutUrl = client.getLogoutUrl(req.query.userId, 'http://127.0.0.1:3000');
    req.session.destroy(); // 세션을 삭제합니다.
    console.log(logoutUrl);
    res.json({logoutUrl}); // SPARCS SSO 로그아웃 URL로 리다이렉트합니다.
  } else {
    res.status(400).send('Invalid request'); // 유효하지 않은 요청인 경우 에러 메시지를 보냅니다.
  }
});



router.get('/welcome', (req, res) => {
  if (req.session.user) {
      res.send('Welcome, ' + JSON.stringify(req.session.user));
  } else {
      res.send('Not logged in');
  }
});

module.exports = router;

