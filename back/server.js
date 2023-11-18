const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const { sequelize } = require('./models');
// const { scrapeAndSave } = require('./utils/scrapeAndSave');

const app = express();

const frontBuildPath = path.join(__dirname, '../front/build');
const secretKey = process.env.SSO_SECRET_KEY;

app.use(express.json());
app.use(cors({
  origin: 'http://127.0.0.1:3000', // 프론트엔드 서버 주소
  credentials: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(frontBuildPath));
app.set('trust proxy', true);
app.use(session({
  secret: secretKey,
  resave: true,
  saveUninitialized: true,
}));

sequelize
  .sync({ force: false }) //true면 서버 실행마다 테이블 재생성
  .then(() => {
    console.log('Database connected');
  })
  .catch((err) => {
    console.error(err);
  });

const auth = require('./routes/auth');
const userRouter = require('./routes/user');
const clubRouter = require('./routes/club');
const meetingRouter = require('./routes/meeting');
const cafenotice = require('./routes/cafenotice');
app.use('/api/auth', auth);
app.use('/api/cafenotice', cafenotice);
app.use('/api/user', userRouter);
app.use('/api/club', clubRouter);
app.use('/api/meeting', meetingRouter);

const httpServer = http.createServer(app);
httpServer.listen(80, () => {
  console.log("HTTP Server running on port 80");
});

app.get('/', function (req, res) {
  res.sendFile(path.join(frontBuildPath, 'index.html'));
});

app.get('*', function (req, res) {
  res.sendFile(path.join(frontBuildPath, 'index.html'));
});