const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');

const auth = require('./routes/auth');
const userRouter = require('./routes/user');
const clubRouter = require('./routes/club');
const meetingRouter = require('./routes/meeting');

const app = express();

const frontBuildPath = path.join(__dirname, '../front/build');
app.set('trust proxy', true);  // Express가 프록시 뒤에서 실행될 때 필요

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(frontBuildPath));
app.set('trust proxy', true);  // Express가 프록시 뒤에서 실행될 때 필요
app.use('/uploads', express.static('uploads'));

//라우터 설정
app.use('/api/auth', auth);
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