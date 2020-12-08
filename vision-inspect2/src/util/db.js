/**
 * database connection
 * @author duanj
 */

const mysql  = require('mysql');
const _      = require('lodash');
const moment = require('moment');

const {log} = require('./log');

const config = require('../config');

// create pool
const pool = mysql.createPool(config.database);
const poolSX = mysql.createPool(config.databasesx);

// private functions
// get columns
const getCols = cols => {
	if (Array.isArray(cols)) {
		for (const col of cols) {
			if (typeof col !== 'string') {
				throw new Error('Error parameter(s).');
			}
		}
		return cols.join(' , ');
	}
	else if (_.isObject(cols)) {
		let arr = [];
		for (let i in cols) {
			arr.push(`${i} AS ${cols[i]}`);
		}
		return arr.join(' , ');
	}
	else if (typeof cols !== 'string') {
		throw new Error('Error parameter(s).');
	}
	return cols;
};

const getWhere = where => {
	const empty = ['', []];
	if (where === null) {
		return empty;
	}
	const keys = Object.keys(where);
	const len  = keys.length;
	if (len === 0) {
		return empty;
	}
	const sql  = [];
	const data = [];
	for (const key of keys) {
		if (Array.isArray(where[key])) {
			if (where[key].length === 0) {
				sql.push('0=1');
			}
			else {
				sql.push('?? IN (?)');
				data.push(key);
				data.push(where[key]);
			}
		}
		else if (where[key] === String) {
			sql.push(key);
		}
		else {
			sql.push('?');
			data.push({[key]: where[key]});
		}
	}
	return [`WHERE ${sql.join(' AND ')}`, data];
}

// public functions
// query
const query = (sql, data = [], connection = pool) => new Promise((resolve, reject) => {
	const start = moment();
	connection.query(sql, data, (error, results) => {
		const end = moment();
		if (end.diff(start) >= config.longQueryTime * 1000) {
			console.error('SLOW_QUERY', start.format(), end.format(), {sql, data});
		}
		if (error) {
			reject(error);
		}
		if (!sql.startsWith('SELECT')) {
			log('DB', {sql, data});
		}
		resolve(results);
	});
});

// select
const select = (table, cols = '*', where = null, groupBy = null, orderBy = null, limit = null, connection = pool) => {
	const [whereSQL, whereData] = getWhere(where);
	const groupBySQL            = groupBy ? `GROUP BY ${groupBy}` : '';
	const orderBySQL            = orderBy ? `ORDER BY ${orderBy}` : '';
	const limitSQL              = limit ? `LIMIT ${limit}` : '';
	return query(`SELECT ${getCols(cols)} FROM ${table} ${whereSQL} ${groupBySQL} ${orderBySQL} ${limitSQL}`, whereData, connection);
};

// select one
const selectOne = async (table, cols = '*', where = null, connection = pool) => {
	const data = await select(table, cols, where, null, null, null, connection);
	return data.length > 0 ? data[0] : null;
};

// insert
const insert = async (table, data, connection = pool) => {
	return (await query(`INSERT INTO ?? SET ?`, [table, data], connection)).insertId;
};

// insert multiple values
const insertValues = async (table, fields, data, connection = pool) => {
	return await query(`INSERT INTO ?? (${fields.join(',')}) VALUES ?`, [table, data], connection);
};

// delete
const del = async (table, where, connection = pool) => {
	const [whereSQL, whereData] = getWhere(where);
	return (await query(`DELETE FROM ${table} ${whereSQL}`, whereData, connection)).affectedRows;
};

// update
const update = async (table, data, where, connection = pool) => {
	const [whereSQL, whereData] = getWhere(where);
	return (await query(`UPDATE ?? SET ? ${whereSQL}`, [table, data, ...whereData], connection)).affectedRows;
};

// begin transaction
const beginTransaction = () => {
	return new Promise((resolve, reject) => {
		pool.getConnection((error, connection) => {
			if (error) {
				reject(error);
			}
			connection.beginTransaction(error => {
				if (error) {
					connection.release();
					reject(error);
				}
				resolve(connection);
			});
		});
	});
};

// commit transaction
const commit = connection => {
	return new Promise((resolve, reject) => {
		connection.commit(error => {
			if (error) {
				reject(error);
			}
			connection.release();
			resolve();
		});
	});
};

// rollback transaction
const rollback = connection => {
	return new Promise(resolve => connection.rollback(() => {
		connection.release();
		resolve();
	}));
};

module.exports = {
	poolSX,
	query,
	select,
	selectOne,
	insert,
	insertValues,
	del,
	update,
	beginTransaction,
	commit,
	rollback,
};