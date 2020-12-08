/**
 * organization service
 * @author duanj
 */

const {select} = require('../util/db');

const Organization = require('../model/organization');

const table = 'organization';

const getAllOrganizations = async () => {
	const data = await select(table);
	return data.map(row => new Organization(row));
};

module.exports = {
	getAllOrganizations,
};