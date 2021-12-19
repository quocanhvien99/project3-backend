const express = require('express');
const session = require('express-session');
const cors = require('cors');
const redis = require('redis');
const connectRedis = require('connect-redis');
const cron = require('./cron');
require('dotenv').config();

const RedisStore = connectRedis(session);
const redisClient = redis.createClient({
	host: process.env.REDIS_HOST,
	port: 6379,
});

const app = express();

app.use(
	session({
		store: new RedisStore({ client: redisClient }),
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		rolling: true,
		cookie: { maxAge: 30 * 60 * 1000 },
	})
);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
	res.locals.redisClient = redisClient;
	next();
});

const userRoute = require('./Routes/user');
const projectRoute = require('./Routes/project');
const taskRoute = require('./Routes/task');

app.use('/user', userRoute);
app.use('/project', projectRoute);
app.use('/task', taskRoute);

const protectedRoute = require('./Middleware/protectedRoute');
app.get('/private', protectedRoute, (req, res) => res.send('Hello'));

app.use(express.static('public'));

app.listen(process.env.PORT || 3000, () => console.log('Server is running'));

//run cronjob
cron();
