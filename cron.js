const sendMail = require('./Utils/sendMail');
const pgPool = require('./Utils/pgPool');
const cron = require('node-cron');

module.exports = () => {
	//check at 5:30pm
	cron.schedule('30 17 * * *', () => {
		let now = new Date(Date.now());
		const query = `select U.email, T.end_time, T.heading from "task" as T, "user" as U where T.user_id=U.id and completed = $2 and end_time >= ($1::date) and end_time <= ($1::date + '5 days'::interval)`;
		pgPool
			.query(query, [now.toISOString(), false])
			.then((res) => {
				let emailFilter = {};
				res.rows.forEach((x) => {
					if (!emailFilter[x.email]) {
						emailFilter[x.email] = [];
					}
					emailFilter[x.email].push({
						heading: x.heading,
						end_time: x.end_time,
					});
				});
				for (let email in emailFilter) {
					let msg = emailFilter[email].map(
						(x) =>
							`<p><span style="color:blue;font-weight: bold;">${
								x.heading
							}</span> cần hoàn thành trước <span style="color:red;font-weight: bold;">${x.end_time.toISOString()}</span> </p><br>`
					);
					msg = msg.join('');
					//send mail
					sendMail.deadlineAlert(email, msg);
				}
			})
			.catch((err) => console.log(err));
	});
	console.log('cronjob is running');
};
