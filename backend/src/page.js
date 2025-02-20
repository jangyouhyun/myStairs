// 모듈 호출 + 라우터 변수 생성
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const RedisStore = require('connect-redis').default;
const Redis = require('ioredis');
var authCheck = require('../auth/authCheck.js');
var authRouter = require('../auth/auth.js');
var writeRouter = require('./write_page.js');
var template = require('./template.js');

//express 모듈 설정 / 포트번호 설정
const app = express();
var router = express.Router();
const port = 3000; 

app.use('/', router);
//인코딩된 본문 데이터 파싱 -> bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// 세션설정
const redisClient = new Redis({
    host: '127.0.0.1',  // Redis 서버 호스트
    port: 6379         // Redis 서버 포트
});

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// 기본루트 get 
app.get('/', (req, res) => {
	if (!authCheck.isOwner(req, res)) { 
  		res.redirect('/auth/login');
  		return false;
	} else { 
  		res.redirect('/main');
  		return false;
	}
})

// auth 라우터로 분기
app.use('/auth', authRouter);

// 메인 화면 호출
app.get('/main', (req, res) => {
	if (!authCheck.isOwner(req, res)) {  
	  res.redirect('/auth/login');  
	  return false;
	}
	var html = template.HTML('Welcome',
	  `<p>로그인에 성공하셨습니다.</p>
	   <p><a href="/write" class="btn">글 작성하기</a></p>
	  `,
	  authCheck.statusUI(req, res)
	);
	res.send(html);
  })

app.use('/write', writeRouter);

app.use((req,res,next)=>{
    res.status(404).send('Not found');
})

// 포트 연결
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
})
  



