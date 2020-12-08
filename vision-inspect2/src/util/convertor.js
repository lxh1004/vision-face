/**
 * data type convertor tool functions
 * @author duanj
 */

const _ = require('lodash');

const toString  = value => value !== null && value !== undefined ? _.toString(value) : null;
const toBoolean = value => {
	switch (typeof value) {
		case 'boolean':
			return value;

		case 'number':
			return value !== 0;

		default:
			return null;
	}
}

const ReadStream2Buffer = readStream => new Promise(resolve => {
	let chunks = [];
	readStream.on('data', chunk => chunks.push(chunk));
	readStream.on('end', () => resolve(Buffer.concat(chunks)));
});

module.exports = {
	toString,
	toBoolean,
	ReadStream2Buffer,
};
