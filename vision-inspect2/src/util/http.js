/**
 * http tool functions
 * @author duanj
 */

const rp = require('request-promise');

const get = (url, qs = {}, auth = undefined) => rp({
	method  : 'GET',
	uri     : url,
	qs,
	json    : true,
	auth,
	timeout : 20000,
});

const getRaw = url => rp({
	method  : 'GET',
	uri     : url,
	timeout : 10000,
});

const getBinary = url => rp({
	method   : 'GET',
	uri      : url,
	timeout  : 30000,
	encoding : null,
});

const post = (url, data = {}, auth = undefined) => rp({
	method : 'POST',
	uri    : url,
	body   : data,
	json   : true,
	auth,
});

const put = (url, data = {}, auth = undefined) => rp({
	method : 'PUT',
	uri    : url,
	body   : data,
	json   : true,
	auth,
});

module.exports = {
	get,
	getRaw,
	getBinary,
	post,
	put,
};