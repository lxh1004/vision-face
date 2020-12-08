/**
 * global configuration
 * @author duanj
 */

module.exports = {
	// system settings
	url  : 'http://10.88.0.48:3004',
	port : 3004, // port

	// database information
	database : {
		connectionLimit : 5,
		host            : '10.88.0.48',
		user            : 'vision',
		password        : 'vision',
		database        : 'vision',
	},
	databasesx : {
		connectionLimit : 1,
		host            : '10.88.1.102',
		user            : 'app6s',
		password        : 'User@6S199!',
		database        : 'attendancedata',
	},
    longQueryTime : 10,

	// root directory for fs
	fsRoot : '/data/pangu-fs/vision',
	
	// pangu server
	pangu : {
		capture : ip => `http://${ip}:8446/monitorWorker/cameraSnapshot/getImgUrl`,
	},

	// sx server
	sx : {
		tableEvent : 'eventinformation_copy',
	},
};