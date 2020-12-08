/**
 * organization api
 * @author duanj
 */

import website from '@/const/website'
import {get} from '@/util/axios'

const organizationApiBase = `${website.host}/organization`

export function getAllOrganizations() {
	return get(`${organizationApiBase}/getall`)
}
