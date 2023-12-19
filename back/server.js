const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const { sequelize } = require("./models");
const config = require("./config/config");
require("dotenv").config();

const app = express();

const frontBuildPath = path.join(__dirname, "../front/build");
const secretKey = process.env.SSO_SECRET_KEY;
// MySQL 세션 저장소 옵션
const sessionStoreOptions = {
  host: config.host,
  port: config.port,
  user: config.username,
  password: config.password,
  database: config.database,
};
// MySQL 세션 저장소 생성
const sessionStore = new MySQLStore(sessionStoreOptions);

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.static(frontBuildPath));
app.set("trust proxy", true);
app.use(
  session({
    key: "session_cookie_name",
    secret: secretKey,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS 환경에서만 true
      // maxAge: 1000 * 60 * 60 * 24 // 예: 24시간
    },
  })
);

sequelize
  .sync({ force: false }) //true면 서버 실행마다 테이블 재생성
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error(err);
  });

const auth = require("./routes/auth");
const userRouter = require("./routes/user");
const clubRouter = require("./routes/club");
const meetingRouter = require("./routes/meeting");
const cafenotice = require("./routes/cafenotice");
const activity = require("./routes/activity");
app.use("/api/auth", auth);
app.use("/api/cafenotice", cafenotice);
app.use("/api/user", userRouter);
app.use("/api/club", clubRouter);
app.use("/api/meeting", meetingRouter);
app.use("/api/activity", activity);

const httpServer = http.createServer(app);
httpServer.listen(80, () => {
  console.log("HTTP Server running on port 80");
});

app.get("/", function (req, res) {
  res.sendFile(path.join(frontBuildPath, "index.html"));
});

app.get("*", function (req, res) {
  res.sendFile(path.join(frontBuildPath, "index.html"));
});
