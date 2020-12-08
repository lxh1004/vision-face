/**
 * main router
 * @author duanj
 */

const router = require('koa-router')();

// controllers
const InspectController      = require('../controller/inspect');
const OrganizationController = require('../controller/organization');

// web services
router.get('/api/inspect/getpage', InspectController.getPage);
router.get('/api/inspect/getresult', InspectController.getResult);
router.put('/api/inspect/editregion', InspectController.editRegion);
router.put('/api/inspect/editaudit', InspectController.editAudit);
router.put('/api/inspect/notinspect', InspectController.notInspect);
router.get('/api/inspect/export', InspectController.exportImages);

router.get('/api/organization/getall', OrganizationController.getAll);

module.exports = router;