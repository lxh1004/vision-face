/**
 * global configuration
 * @author duanj
 */

module.exports = {
    // system settings
    url  : 'http://localhost:3004',
    port : 3004, // port

    // database information
    database : {
        host     : 'localhost',
        user     : 'root',
        password : '123456',
        database : 'vision',
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
    fsRoot : '/Users/allen/Documents/source/vision-fs',
    
    // pangu server
	pangu : {
        capture : ip => `http://${ip}:8446/monitorWorker/cameraSnapshot/getImgUrl`,
    },

	// sx server
	sx : {
		tableEvent : 'eventinformation',
	},
};