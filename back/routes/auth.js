const express = require("express");
const router = express.Router();
// const session = require('express-session');
require("dotenv").config();
const Client = require("../utils/sparcssso");

const clientId = process.env.SSO_CLIENT_ID;
const secretKey = process.env.SSO_SECRET_KEY;
const client = new Client(clientId, secretKey);

// router.use(session({
//   secret: secretKey,
//   resave: false,
//   saveUninitialized: true
// }));

router.get("/check-session", (req, res) => {
  if (!req.session.user) {
    // 세션이 만료되었거나 로그인 상태가 아님
    res
      .status(401)
      .json({ message: "세션이 만료되었습니다", isLoggedIn: false });
  } else {
    // 세션이 유효함
    res.status(200).json({ isLoggedIn: true, user: req.session.user });
  }
});

router.get("/login", async (req, res) => {
  const { url, state } = client.getLoginParams();
  req.session.state = state;
  await req.session.save();

  // 클라이언트에게 SPARCS SSO 로그인 URL 응답으로 보내기
  res.json({ loginUrl: url });
});

router.get("/callback", async (req, res) => {
  const { code, state } = req.query;
  // const { state } = req.session;

  try {
    // const userInfo = await client.getUserInfo(code, state);
    const loginInfo = { code, state };
    res.redirect(
      `${
        process.env.FRONTEND_URL.includes("http")
          ? process.env.FRONTEND_URL
          : `https://${process.env.FRONTEND_URL}`
      }/?loginInfo=${JSON.stringify(loginInfo)}`
    );
  } catch (error) {
    res.send("Error: " + error.message);
  }
});

router.get("/logout", (req, res) => {
  const userIdFromQuery = req.query.userId; // 쿼리 파라미터에서 userId 값을 가져옵니다.

  if (req.query.userId) {
    const logoutUrl = client.getLogoutUrl(
      req.query.userId,
      `${
        process.env.FRONTEND_URL.includes("http")
          ? process.env.FRONTEND_URL
          : `https://${process.env.FRONTEND_URL}`
      }`
    );
    req.session.destroy(); // 세션을 삭제합니다.
    console.log(logoutUrl);
    res.json({ logoutUrl }); // SPARCS SSO 로그아웃 URL로 리다이렉트합니다.
  } else {
    res.status(400).send("Invalid request"); // 유효하지 않은 요청인 경우 에러 메시지를 보냅니다.
  }
});

router.get("/welcome", (req, res) => {
  if (req.session.user) {
    res.send("Welcome, " + JSON.stringify(req.session.user));
  } else {
    res.send("Not logged in");
  }
});

module.exports = router;
