/**
 * log tool functions
 * @author duanj
 */

const moment = require('moment');

const log = (title, data, ctx) => {
	if (ctx) {
		console.log(moment().format(), `[${title}]`, ctx.session.userId, ctx.request.ip, data);
	}
	else {
		console.log(moment().format(), `[${title}]`, data);
	}
}

module.exports = {
	log,
};