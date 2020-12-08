/**
 * request tool functions
 * @author duanj
 */

const _ = require('lodash');

const checkParams = (params, keys) => {
	if (!_.isObject(params)) {
		return false;
	}
	for (const key of keys) {
		if (!_.has(params, key)) {
			return false;
		}
	}
	return true;
};

module.exports = {
	checkParams,
};