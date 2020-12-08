/**
 * main entry
 * @author duanj
 */

const cluster = require('cluster');
const Koa     = require('koa');

require('./util/db');

// middlewares
const bodyparser = require('koa-bodyparser');
const logger     = require('koa-logger');
const serve      = require('koa-static');
const cors       = require('koa2-cors');

// router
const router = require('./router');

// schedules
const startSchedules = require('./schedule');

// config
const config = require('./config');

// create app
const app = new Koa();

// use middlewares
app.use(bodyparser({
	enableTypes: ['json', 'form', 'text'],
}));
app.use(logger());
app.use(serve(__dirname+'/public'));
// app.use(serve(config.fsRoot));
app.use(cors({credentials: true}));

// use router
app.use(router.routes(), router.allowedMethods());

// start schedules
if (cluster.isMaster) {
	startSchedules();
}

// bind server
app.listen(config.port);
