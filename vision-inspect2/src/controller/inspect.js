/**
 * inspect controller
 * @author duanj
 */

const moment = require('moment');

const {checkParams} = require('../util/request');
const {ok, err}     = require('../util/response');

const config = require('../config');

const {
	getInspectionsByPage,
	getInspectionTotal,
	getAllResults,
	getResultByOrganizationId,
	editInspectRegion,
	editInspectAudit,
	exportInspectImages,
}                            = require('../service/inspect');
const {getAllOrganizations}  = require('../service/organization');
const {editCameraNotInspect} = require('../service/camera');

const Errors = {
	ErrorParameters : [1001, '系统内部错误，请重试。'],
	DatabaseError   : [1002, '系统内部错误，请重试。'],
};

// TODO SQL injection danger
const getPage = async ctx => {
	if (!checkParams(ctx.request.query, ['page_num', 'page_count', 'start_time', 'end_time'])) {
		ctx.body = err(Errors.ErrorParameters);
		return;
	}
	try {
		// get organizations
		const organizations    = await getAllOrganizations();
		const organizationList = {};
		for (const organization of organizations) {
			organizationList[organization.get('id')] = organization.toPlain();
		}
		for (const id in organizationList) {
			let p = id;
			for (; organizationList[p].pid !== null; p = organizationList[p].pid);
			organizationList[id].department = organizationList[p].name;
		}

		// get query
		const query = {...ctx.request.query};
		if (query.audit) {
			query.audit = query.audit.split(',');
		}
		const inspections = await getInspectionsByPage(query);
		const total       = await getInspectionTotal(query);
		ctx.body          = ok({
			total : total && total['COUNT(*)'] ? total['COUNT(*)'] : 0,
			data  : inspections.map(inspection => ({
				...inspection,
				department : organizationList[inspection.organization_id]
					? organizationList[inspection.organization_id].department
					: null,
				company : organizationList[inspection.organization_id]
					? organizationList[inspection.organization_id].name
					: null,
				time   : moment(inspection.time).format('YYYY-MM-DD HH:mm:ss'),
				// image  : inspection.capture_url,
				image  : `${config.url}/inspect/${inspection.id}.jpg`,
				region : inspection.region ? JSON.parse(inspection.region) : null,
			})),
		});
	}
	catch (e) {
		console.error(e);
		ctx.body = err(Errors.DatabaseError);
	}
};

const getResult = async ctx => {
	if (!checkParams(ctx.request.query, ['start', 'end'])) {
		ctx.body = err(Errors.ErrorParameters);
		return;
	}
	try {
		let results = [];
		if (ctx.request.query.organization_id) {
			const data = await getResultByOrganizationId(ctx.request.query);
			results = [data];
		}
		else {
			const data = await getAllResults(ctx.request.query);
			const sum  = {
				name    : '总计',
				count   : 0,
				capture : 0,
				audit   : [0, 0, 0],
			};
			for (const {count, capture, audit} of data) {
				sum.count   += count;
				sum.capture += capture;
				for (let i = 0; i < 3; i++) {
					sum.audit[i] += audit[i];
				}
			}
			data.push(sum);
			results = data;
		}
		ctx.body = ok(results);
	}
	catch (e) {
		console.error(e);
		ctx.body = err(Errors.DatabaseError);
	}
};

const editRegion = async ctx => {
	if (!checkParams(ctx.request.body, ['id', 'region'])) {
		ctx.body = err(Errors.ErrorParameters);
		return;
	}
	try {
		const {id, region} = ctx.request.body;
		await editInspectRegion(id, JSON.stringify(region));
		ctx.body = ok();
	}
	catch (e) {
		console.error(e);
		ctx.body = err(Errors.DatabaseError);
	}
};

const editAudit = async ctx => {
	if (!checkParams(ctx.request.body, ['id', 'audit'])) {
		ctx.body = err(Errors.ErrorParameters);
		return;
	}
	try {
		const {id, audit} = ctx.request.body;
		await editInspectAudit(id, audit);
		ctx.body = ok();
	}
	catch (e) {
		console.error(e);
		ctx.body = err(Errors.DatabaseError);
	}
};

const notInspect = async ctx => {
	if (!checkParams(ctx.request.body, ['camera_id'])) {
		ctx.body = err(Errors.ErrorParameters);
		return;
	}
	try {
		await editCameraNotInspect(ctx.request.body.camera_id);
		ctx.body = ok();
	}
	catch (e) {
		console.error(e);
		ctx.body = err(Errors.DatabaseError);
	}
};

// deprecated
const exportImages = async ctx => {
	if (!checkParams(ctx.request.query, ['organization_id', 'start', 'end'])) {
		ctx.body = err(Errors.ErrorParameters);
		return;
	}
	try {
		await exportInspectImages(ctx);
	}
	catch (e) {
		console.error(e);
		ctx.body = err(Errors.DatabaseError);
	}
};

module.exports = {
	getPage,
	getResult,
	editRegion,
	editAudit,
	notInspect,
	exportImages,
};