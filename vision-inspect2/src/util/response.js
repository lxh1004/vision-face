/**
 * response data factory
 * @author duanj
 */

const response = (e, msg, data) => {
	return {e, msg, data};
};

const ok = (data = {}) => {
	return response(0, 'ok', data);
};

const err = (e, msg = 'Unknown Error.') => {
	if (Array.isArray(e)) {
		[e, msg] = e;
	}
	return response(e, msg, {});
};

module.exports = {
	response,
	ok,
	err,
};