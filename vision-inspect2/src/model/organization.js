/**
 * organization model
 * @author duanj
 */

const Model = require('./model.js');

class Organization extends Model {
	// constructor
	constructor(row) {
		super([
			'id',
			'name',
			'pid',
		], {id: String, pid: String});

		if (row) {
			this.fromRowData(row);
		}
	}
}

module.exports = Organization;