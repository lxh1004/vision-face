/**
 * organization controller
 * @author duanj
 */

const {ok, err} = require('../util/response');

const {getAllOrganizations} = require('../service/organization');

const Errors = {
	DatabaseError : [2001, '系统内部错误，请重试。'],
};

const getAll = async ctx => {
	try {
		const organizations = await getAllOrganizations();
		ctx.body            = ok(organizations.map(organization => organization.toPlain()));
	}
	catch (e) {
		console.error(e);
		ctx.body = err(Errors.DatabaseError);
	}
};

module.exports = {
	getAll,
};