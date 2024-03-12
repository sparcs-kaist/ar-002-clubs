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
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS 환경에서만 true
      maxAge: 1000 * 60 * 60 * 3,
    },
  })
);
var bodyParser = require("body-parser");

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

sequelize
  .sync({ force: false }) //true면 서버 실행마다 테이블 재생성
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error(err);
  });

const auth = require("./routes/auth");
app.use("/api/auth", auth);
const userRouter = require("./routes/user");
app.use("/api/user", userRouter);
const clubRouter = require("./routes/club");
app.use("/api/club", clubRouter);
const meetingRouter = require("./routes/meeting");
app.use("/api/meeting", meetingRouter);
const cafenotice = require("./routes/cafenotice");
app.use("/api/cafenotice", cafenotice);
const activity = require("./routes/activity");
app.use("/api/activity", activity);
const feedback = require("./routes/feedback");
app.use("/api/feedback", feedback);
const funding = require("./routes/funding");
app.use("/api/funding", funding);
const funding_feedback = require("./routes/funding_feedback");
app.use("/api/funding_feedback", funding_feedback);
const registration = require("./routes/registration");
app.use("/api/registration", registration);
const registration_feedback = require("./routes/registration_feedback");
app.use("/api/registration_feedback", registration_feedback);

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
