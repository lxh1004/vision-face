/**
 * inspect service
 * @author duanj
 */

const JSZip  = require('jszip');
const moment = require('moment');

const {poolSX, select, selectOne, insertValues, update} = require('../util/db');
const {getBinary}                                       = require('../util/http');

const config = require('../config');

const table = 'inspect2';

// private functions
const _getParams = ({
	page_num        : pageNum,
	page_count      : pageCount,
	organization_id : organizationId,
	start_time      : startTime,
	end_time        : endTime,
	confidence_min  : confidenceMin,
	confidence_max  : confidenceMax,
	audit,
	name,
	ip,
	sort_by         : sortBy,
	order,
}) => {
	// get table
	const table = 'inspect2 \
		LEFT JOIN camera ON camera.id=inspect2.camera_id';

	// get fields
	const fields = {
		'inspect2.id'            : 'id',
		'camera.organization_id' : 'organization_id',
		'camera.`name`'          : '`name`',
		'camera.ip'              : 'ip',
		'inspect2.time'          : 'time',
		'inspect2.capture_url'   : 'capture_url',
		'inspect2.region'        : 'region',
		'inspect2.audit'         : 'audit',
		'inspect2.camera_id'     : 'camera_id',
		'inspect2.rectify'       : 'rectify',
		'inspect2.confidence'    : 'confidence',
	};

	// get where
	const where = {['inspect2.capture_url IS NOT NULL']: String};
	if (organizationId && organizationId !== '') {
		const organizations = organizationId.split(',');
		if (organizations.length > 0) {
			where['camera.organization_id'] = organizations;
		}
	}
	if (startTime) {
		where[`inspect2.time>='${startTime}'`] = String;
	}
	if (endTime) {
		where[`inspect2.time<='${endTime}'`] = String;
	}
	if (confidenceMin) {
		where[`inspect2.confidence>=${confidenceMin}`] = String;
	}
	if (confidenceMax) {
		where[`inspect2.confidence<=${confidenceMax}`] = String;
	}
	if (Array.isArray(audit) && audit.length > 0) {
		where['inspect2.audit'] = audit;
	}
	if (name) {
		where[`camera.\`name\` LIKE '%${name}%'`] = String;
	}
	if (ip) {
		where[`camera.ip LIKE '%${ip}%'`] = String;
	}

	// get orderBy
	let orderBy = null;
	if (order === 'ascending') {
		orderBy = `\`${sortBy}\` ASC`;
	}
	else if (order === 'descending') {
		orderBy = `\`${sortBy}\` DESC`;
	}

	// get limit
	pageNum     = parseInt(pageNum);
	pageCount   = parseInt(pageCount);
	const limit = `${(pageNum - 1) * pageCount},${pageCount}`;
	return {table, fields, where, orderBy, limit};
}

const getInspectionsByPage = async query => {
	const {table, fields, where, orderBy, limit} = _getParams(query);
	const data                                   = await select(table, fields, where, null, orderBy, limit);
	return data;
};

const getInspectionTotal = async query => {
	const {table, where} = _getParams(query);
	const data           = await selectOne(table, 'COUNT(*)', where);
	return data;
};

const getInspectionsByTime = async time => {
	const table = 'inspect2 \
		LEFT JOIN camera ON camera.id=inspect2.camera_id \
		LEFT JOIN location ON location.id=camera.location_id';
	const fields = {
		'inspect2.id'              : 'id',
		'camera.ip'                : 'ip',
		'location.pangu_worker_ip' : 'pangu_worker_ip',
	};
	const data = await select(table, fields, {time: time.format('YYYY-MM-DD HH:mm:ss')});
	return data;
};

const getAuditedInspections = async (start, end) => {
	const table = 'inspect2 \
		LEFT JOIN camera ON camera.id=inspect2.camera_id';
	const fields = {
		'camera.ip'           : 'ip',
		'inspect2.audit'       : 'audit',
		'inspect2.capture_url' : 'url',
	};
	const where = {
		'(inspect2.audit IS NULL OR inspect2.audit = 1)' : String,
		[`inspect2.time>='${start}'`]                   : String,
		[`inspect2.time<='${end}'`]                     : String,
		'inspect2.capture_url IS NOT NULL'              : String,
	};
	const data = await select(table, fields, where);
	return data;
};

const getAllResults = async ({start, end}) => {
	// get count
	const results = {};
	const table = 'inspect2 \
		LEFT JOIN camera ON camera.id=inspect2.camera_id \
		LEFT JOIN organization ON organization.id=camera.organization_id';
	const fields = {
		'camera.organization_id' : 'id',
		'organization.`name`'    : 'name',
		'COUNT(*)'               : 'count',
	};
	const where = {
		[`inspect2.time BETWEEN '${start}' AND '${end}'`] : String,
	}
	let data = await select(table, fields, where, 'camera.organization_id');
	for (const item of data) {
		const [key, name] = item.id ? [item.id, item.name] : ['null', '未配置组织机构'];
		results[key] = {...item, name, capture: 0, audit: [0, 0, 0]};
	}

	// get audit count
	const tableAudit = 'inspect2 \
		LEFT JOIN camera ON camera.id=inspect2.camera_id';
	const fieldsAudit = {
		'camera.organization_id' : 'id',
		'inspect2.audit'          : 'audit',
		'COUNT(*)'               : 'count',
	};
	const whereAudit = {
		[`inspect2.time BETWEEN '${start}' AND '${end}'`] : String,
		'inspect2.capture_url IS NOT NULL'                : String,
	}
	data = await select(tableAudit, fieldsAudit, whereAudit, 'camera.organization_id, inspect2.audit');
	for (const {id, audit, count} of data) {
		if (typeof audit === 'number' && audit >= 0 && audit < 3) {
			const key                 = id || 'null';
			results[key].capture     += count;
			results[key].audit[audit] = count;
		}
	}
	return Object.values(results);
}

const getResultByOrganizationId = async ({organization_id: organizationId, start, end}) => {
	// get count
	let result  = {};
	const table = 'inspect2 \
		LEFT JOIN camera ON camera.id=inspect2.camera_id \
		LEFT JOIN organization ON organization.id=camera.organization_id';
	const fields = {
		'organization.`name`' : 'name',
		'COUNT(*)'            : 'count',
	};
	const where = {
		[`inspect2.time BETWEEN '${start}' AND '${end}'`] : String,
		'camera.organization_id'                         : organizationId,
	}
	let data = await selectOne(table, fields, where);
	result   = {...data, capture: 0, audit: [0, 0, 0]};

	// get audit count
	const tableAudit = 'inspect2 \
		LEFT JOIN camera ON camera.id=inspect2.camera_id';
	const fieldsAudit = {
		'inspect2.audit' : 'audit',
		'COUNT(*)'      : 'count',
	};
	const whereAudit = {
		[`inspect2.time BETWEEN '${start}' AND '${end}'`] : String,
		'inspect2.capture_url IS NOT NULL'                : String,
		'camera.organization_id'                          : organizationId,
	}
	data = await select(tableAudit, fieldsAudit, whereAudit, 'inspect2.audit');
	for (const {audit, count} of data) {
		if (typeof audit === 'number' && audit >= 0 && audit < 3) {
			result.capture     += count;
			result.audit[audit] = count;
		}
	}
	return result;
}

const addInspections = async inspections => {
	if (inspections.length === 0) {
		return;
	}
	const fields = ['camera_id', 'time', 'rectify'];
	await insertValues(table, fields, inspections);
};

const editInspectCaptureUrl = async (id, url) => {
	await update(table, {capture_url: url}, {id});
};

const editInspectRegion = async (id, region) => {
	await update(table, {region}, {id});
};

const editInspectAudit = async (id, audit) => {
	await update(table, {audit}, {id});
};

const exportInspectImages = async ctx => {
	const table = 'inspect2 \
		LEFT JOIN camera ON camera.id=inspect2.camera_id';
	const fields = {
		'inspect2.audit'       : 'audit',
		'inspect2.capture_url' : 'url',
	};
	const where = {
		'(inspect2.audit IS NULL OR inspect2.audit = 1)' : String,
		'camera.organization_id'                         : ctx.request.query.organization_id,
		[`inspect2.time>='${ctx.request.query.start}'`]  : String,
		[`inspect2.time<='${ctx.request.query.end}'`]    : String,
		'inspect2.capture_url IS NOT NULL'               : String,
	};
	const data = await select(table, fields, where);

	// export data
	// TODO memory overflow danger
	const zip = new JSZip();
	zip.folder('普通');
	zip.folder('严重');
	let log          = '';
	let countSuccess = 0;
	let countFailed  = 0;
	for (const {audit, url} of data) {
		try {
			const file = await getBinary(url);
			const filename = url.match(/\/([^\/]+)$/)[1];
			zip.file(`${audit === 1 ? '严重' : '普通'}/${filename}`, file);
			countSuccess++;
		}
		catch (e) {
			log += `${url}下载失败。[${audit === 1 ? '严重' : '普通'}]\n${e.message}\n`;
			countFailed++;
		}
	}
	zip.file('log.txt', `下载成功 ${countSuccess} 个文件，失败 ${countFailed} 个文件。\n${log}`);
	ctx.set('Content-Type', 'application/zip');
	ctx.set('Content-Disposition', 'attachment; filename=files.zip');
	ctx.body = await zip.generateNodeStream({type: 'nodebuffer', streamFiles: true});
};

const submitEvents = async inspections => {
	if (inspections.length === 0) {
		return;
	}
	const table  = config.sx.tableEvent;
	const fields = [
		'eventimgurl',
		'camera_ip',
		'eventtype',
		'eventstarttime',
		'eventendtime',
		'eventstate',
		'createtime',
		'isflag',
		'workno',
		'username',
		'department',
		'checkFilter',
		'event_level',
	];
	const data = inspections.map(({ip, audit, url}) => {
		const match = url.match(/_(\d{14})\.jpeg$/);
		if (!match) {
			console.error('无法获取时间属性。', url);
			return null;
		}
		const time = moment(match[1], 'YYYYMMDDHHmmss').format();
		return [
			url,
			ip,
			'sxmanage',
			time,
			time,
			'0',
			time,
			'1',
			'NULL',
			'NULL',
			'NULL',
			'1',
			audit === 1 ? 2 : 1,
		];
	}).filter(item => item !== null);
	await insertValues(table, fields, data, poolSX);
};

module.exports = {
	getInspectionsByPage,
	getInspectionsByTime,
	getInspectionTotal,
	getAuditedInspections,
	getAllResults,
	getResultByOrganizationId,
	addInspections,
	editInspectCaptureUrl,
	editInspectRegion,
	editInspectAudit,
	exportInspectImages,
	submitEvents,
};