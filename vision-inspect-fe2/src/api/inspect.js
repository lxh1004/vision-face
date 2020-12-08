/**
 * organization api
 * @author duanj
 */

import moment from 'moment'
import axios from 'axios'

import website from '@/const/website'
import {get, put} from '@/util/axios'

const inspectApiBase = `${website.host}/inspect`

export function getInspections(query, { prop, order }) {

	const data = { ...query }
	if (order) {
		data.sort_by = prop
		data.order   = order
	}
	if (Array.isArray(query.audit) && query.audit.length > 0) {
		data.audit = query.audit.join(',')
	}
	else {
		delete data.audit
	}
	return get(`${inspectApiBase}/getpage`, data)
}

export function editInspectRegion(id, region) {
	return put(`${inspectApiBase}/editregion`, {id, region})
}

export function editInspectAudit(id, audit) {
	return put(`${inspectApiBase}/editaudit`, {id, audit})
}

export function editNotInspect(cameraId) {
	return put(`${inspectApiBase}/notinspect`, {camera_id: cameraId})
}

export function exportImages(organizationId, [start, end], [scoreMin, scoreMax], audit, signed) {
	if (audit.length === 0) {
		audit = [1, 2]
	}
	const params = new URLSearchParams({
		organizationId,
		start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
		end: moment(end).format('YYYY-MM-DD HH:mm:ss'),
		scoreMin,
		scoreMax,
		audits: audit,
		annotation: signed
	})
	return `${website.pangu.download}?${params.toString()}`
}

export function getResult(organizationId, start, end) {
	return get(`${inspectApiBase}/getresult`, {
		organization_id: organizationId,
		start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
		end: moment(end).format('YYYY-MM-DD HH:mm:ss')
	})
}

export async function replenish(organizationId) {
	const data = axios.get(website.pangu.replenish, { params: { organizationId } })
	if (data.success !== 200) {
		throw new Error(data.msg)
	}
}


export function exportAllImages( [start, end], [scoreMin, scoreMax], audit, signed) {
	if (audit.length === 0) {
		audit = [1, 2]
	}
	const params = new URLSearchParams({
		start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
		end: moment(end).format('YYYY-MM-DD HH:mm:ss'),
		scoreMin,
		scoreMax,
		audits: audit,
		annotation: signed
	})
	return `${website.pangu.downloadAll}?${params.toString()}`
}
