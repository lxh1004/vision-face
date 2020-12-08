/**
 * base model
 * @author duanj
 */

const _ = require('lodash');

const {toString, toBoolean} = require('../util/convertor');

class Model {
	// constructor
	constructor(keys, types = {}) {
		// set convertor
		this.__convertor = this.__getConvertor(keys);
		this.__types     = types;

		// init null value
		for (let key in this.__convertor) {
			this[key] = null;
		}
	}

	// convert from row data
	fromRowData(row) {
		this.fromPlain(row);
	}

	// convert from plain object
	fromPlain(row) {
		for (let key in this.__convertor) {
			switch (this.__types[this.__convertor[key]]) {
				case String:
					this[key] = toString(row[this.__convertor[key]]);
					break;

				case Boolean:
					this[key] = toBoolean(row[this.__convertor[key]]);
					break;

				default:
					this[key] = row[this.__convertor[key]];
			}
		}
	}

	// convert to plain object
	toPlain(keys, revert = false) {
		// get convertor
		let convertor;
		if (keys) {
			convertor = this.__getConvertor(keys);
		}
		else {
			convertor = this.__convertor;
		}

		// get plain object data
		let plain = {};
		if (revert) {
			for (let key in convertor) {
				switch (this.__types[convertor[key]]) {
					case Boolean:
						plain[convertor[key]] = this[key] ? 1 : 0;
						break;

					default:
						plain[convertor[key]] = this[key];
				}
			}
		}
		else {
			for (let key in convertor) {
				plain[convertor[key]] = this[key];
			}
		}
		return plain;
	}

	// get a property
	get(key) {
		key = _.findKey(this.__convertor, o => o === key);
		if (key) {
			return this[key];
		}
		else {
			return null;
		}
	}

	// get a property
	set(key, value) {
		key = _.findKey(this.__convertor, o => o === key);
		if (key) {
			this[key] = value;
		}
	}

	// private functions
	// get convertor
	__getConvertor(keys) {
		let convertor = {};
		if (Array.isArray(keys)) {
			for (const key of keys) {
				convertor[`_${key}`] = key;
			}
		}
		else if (_.isObject(keys)) {
			convertor = {...keys};
		}
		else {
			throw new Error('Unexpected Parameter.');
		}
		return convertor;
	}
}

module.exports = Model;