const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.deadlineAlert = (to, html) => {
	const msg = {
		to,
		from: 'alert@project3.tk', // Use the email address or domain you verified above
		subject: 'Cảnh báo hạn hoàn thành công việc',
		text: 'and easy to do anywhere, even with Node.js',
		html,
	};
	sgMail.send(msg).then(
		() => {},
		(error) => {
			console.error(error);

			if (error.response) {
				console.error(error.response.body);
			}
		}
	);
};
