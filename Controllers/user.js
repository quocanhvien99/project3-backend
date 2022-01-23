const pgPool = require('../Utils/pgPool');
const sendMail = require('../Utils/sendMail');

exports.register = (req, res) => {
	const { email, password, name } = req.body;
	const query = 'insert into "user"(name, email, password) values ($1, $2, $3)';

	pgPool
		.query(query, [name, email, password])
		.then((resp) => res.status(201).json({ msg: 'Success' }))
		.catch((err) => res.status(400).json(err.detail));
};

exports.login = async (req, res) => {
	const { email, password } = req.body;
	const query = 'select * from "user" where email=$1';

	pgPool.query(query, [email]).then((resp) => {
		if (resp.rows.length == 0 || resp.rows[0].password != password)
			return res
				.status(400)
				.json({ msg: 'Thông tin đăng nhập không chính xác' });
		req.session.uid = resp.rows[0].id;
		console.log(resp.rows[0].id);
		res.json({ msg: 'Ok' });
	});
};

exports.logout = async (req, res) => {
	req.session.destroy();
	res.json({ msg: 'Ok' });
};

exports.forgetPassword = async (req, res) => {
	const { email } = req.body;
	let activationCode = Math.round(Math.random() * 9999);
	activationCode = activationCode.toString();
	let zeros = [];
	for (let i = 0; i < 4 - activationCode.length; i++) zeros.push('0');
	zeros = zeros.join('');
	activationCode = zeros + activationCode;
	res.locals.redisClient.HSET('forgetCode', email, activationCode);
	sendMail.forgetCode(email, activationCode);
	res.json({ msg: 'Ok' });
};

exports.resetPassword = async (req, res) => {
	const { email, code, password } = req.body;

	res.locals.redisClient.HGET('forgetCode', email, (err, exactCode) => {
		console.log(exactCode);
		console.log(code);
		if (exactCode != code) {
			return res.status(400).json({ msg: 'Code is wrong' });
		}

		const query = 'update "user" set password=$1 where email=$2';
		pgPool
			.query(query, [password, email])
			.then((resp) => {
				res.json({ msg: 'Password changed' });
			})
			.catch((err) => res.status(400).json({ error: err }));
	});
};
