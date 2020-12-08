/**
 * organization api
 * @author duanj
 */
import website from '@/const/website'
import { get,put,post} from '@/util/axios'
import moment from 'moment'

const inspectApiBase = `${website.photo}/inspect`

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
	if (Array.isArray(query.violationReasons) && query.violationReasons.length > 0) {
		data.violationReasons = query.violationReasons.join(',')
	}
	else {
		delete data.violationReasons
	}
	return get(`${inspectApiBase}/inspect/select`, data)
}

export function getPhotoInspections(query, { prop, order }) {
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
	if (Array.isArray(query.violationReasons) && query.violationReasons.length > 0) {
		data.violationReasons = query.violationReasons.join(',')
	}
	else {
		delete data.violationReasons
	}
	return get(`${inspectApiBase}/smartCubeInspect/select`, data)
}


export function getInspectResult(organizationId, start, end) {
	return get(`${inspectApiBase}/inspect/getAuditResult`, {
		organization_id: organizationId,
		start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
		end: moment(end).format('YYYY-MM-DD HH:mm:ss')
	})
}

export function getAuditResult(organizationId, start, end) {
	return get(`${inspectApiBase}/smartCubeInspect/getAuditResult`, {
		organization_id: organizationId,
		start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
		end: moment(end).format('YYYY-MM-DD HH:mm:ss')
	})
}

export function editPhotoRegion(id, region) {
	return put(`${inspectApiBase}/smartCubeInspect/updateRegion`, {id, region})
}

export function edditPhotoesAudit(id, audit) {
	return put(`${inspectApiBase}/smartCubeInspect/updateAudit`, {id, audit})
}

export function editCapturePlan(query) {
	return post(`${inspectApiBase}/capturePlan/save`, query)
}


export function getCapturePlan() {
	return get(`${inspectApiBase}/capturePlan/select`)
}

export function exportAtlasImages(organizationId, [start, end], [scoreMin, scoreMax], audit, signed) {
	if (audit.length === 0) {
		audit = [2]
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
	return `${website.pangu.downloadAtlas}?${params.toString()}`
}

export function exportAtlasAllImages( [start, end], [scoreMin, scoreMax], audit, signed) {
	if (audit.length === 0) {
		audit = [2]
	}
	const params = new URLSearchParams({
		start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
		end: moment(end).format('YYYY-MM-DD HH:mm:ss'),
		scoreMin,
		scoreMax,
		audits: audit,
		annotation: signed
	})
	return `${website.pangu.downloadAtlasAll}?${params.toString()}`
}


