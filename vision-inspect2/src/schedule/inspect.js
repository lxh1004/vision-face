/**
 * inspect schedule
 * @author duanj
 */

const schedule = require('node-schedule');
const moment   = require('moment');

const {
	getInspectionsByTime,
	getAuditedInspections,
	addInspections,
	editInspectCaptureUrl,
	submitEvents,
} = require('../service/inspect');
const {
	getInspectCameras,
	getCameraCaptureUrl,
} = require('../service/camera');

// variables
const captureInterval = 5; // minutes

const startPlanSchedule = () => {
	schedule.scheduleJob('0 0 * * *', async fireDate => {
		// insert plan
		const plan = async (organizationIds, times) => {
			// get all cameras for inspection in random order
			const cameras            = await getInspectCameras(organizationIds);
			const randomOrderCameras = cameras.sort(() => Math.random() - 0.5);

			// get minutes
			const getMin = time => time[0] * 60 + time[1];
			const getMinDef = ([time1, time2]) => getMin(time2) - getMin(time1);
		
			// insert plan
			let timeCount = 0;
			for (const time of times) {
				timeCount += getMinDef(time);
			}
			timeCount        /= captureInterval;
			const size        = randomOrderCameras.length;
			const batch       = Math.ceil(size / timeCount);
			const inspections = [];
			const start       = moment(fireDate).startOf('day');
			let i             = 0;
			for (const time of times) {
				const t   = moment(start).add(getMin(time[0]), 'm');
				const end = moment(start).add(getMin(time[1]), 'm');
				while (true) {
					t.add(captureInterval, 'm');
					if (t.isAfter(end)) {
						break;
					}
					for (let j = i * batch; j < size && j < (i + 1) * batch; j++) {
						inspections.push([randomOrderCameras[j].id, t.format('YYYY-MM-DD HH:mm:ss'), randomOrderCameras[j].inspect_audit]);
					}
					i++;
				}
			}
			await addInspections(inspections);
		}
		await plan([4, 5, 6, 9, 11, 23, 29, 45, 46, 64, 76, 82, // A batch
			12, 13, 14, 15, 16, 22, 24, 26, 30, 81, 97, 102], // B batch
			[[[8, 0], [9, 0]]]);
		await plan([8, 25, 28, 44, 67, 74, 77, 78, 80], // C batch
			[[[14, 0], [15, 0]]]);
	});
};

const startCaptureSchedule = () => {
	schedule.scheduleJob(`*/${captureInterval} * * * *`, async fireDate => {
		const time        = moment(fireDate);
		const inspections = await getInspectionsByTime(time);
		const getCapture  = async ({id, ip, pangu_worker_ip: panguWorkerIp}) => {
			try {
				const url = await getCameraCaptureUrl(panguWorkerIp, ip);
				await editInspectCaptureUrl(id, url);
			}
			catch (e) {
				console.error(`[${moment().format()}]`, ip, panguWorkerIp, e.message);
			}
		};
		const group = 10;
		for (let i = 0; i < inspections.length; i += group) {
			const promises = [];
			for (let j = i; j < inspections.length && j < i + group; j++) {
				promises.push(getCapture(inspections[j]));
			}
			await Promise.all(promises);
		}
	});
};

const startSubmitEventsSchedule = () => {
	schedule.scheduleJob(`0 0 * * *`, async fireDate => {
		const end         = moment(fireDate).format();
		const start       = moment(end).subtract(1, 'days').format();
		const inspections = await getAuditedInspections(start, end);
		await submitEvents(inspections);
	});
};

module.exports = {
	startPlanSchedule,
	startCaptureSchedule,
	startSubmitEventsSchedule,
};
