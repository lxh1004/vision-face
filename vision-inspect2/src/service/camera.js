/**
 * inspect service
 * @author duanj
 */

const {select, del, update} = require('../util/db');
const {get}                 = require('../util/http');

const config = require('../config');

const table    = 'camera';
const tableTag = 'cameratag';

const getInspectCameras = async organizationIds => {
	const data = await select(table, 'id, inspect_audit', {
		not_inspect     : 0,
		type            : [0, 1, 2, 12, 13, 14, 15],
		organization_id : organizationIds,
	});
	return data;
};

const getCameraCaptureUrl = async (panguWorkerIp, ip) => {
	const url = await get(config.pangu.capture(panguWorkerIp), {ip});
	if (url && url !== '') {
		return url;
	}
	else {
		throw new Error('获取图片失败');
	}
};

const editCameraNotInspect = async id => {
	await update(table, {not_inspect: 1}, {id});
	await del(tableTag, {camera_id: id, tag: 20});
};

module.exports = {
    getInspectCameras,
    getCameraCaptureUrl,
	editCameraNotInspect,
};