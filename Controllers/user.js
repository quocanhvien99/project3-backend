const pgPool = require('../Utils/pgPool');

exports.register = (req, res) => {
	const { email, password, name } = req.body;
	const query = 'insert into "user"(name, email, password) values ($1, $2, $3)';

	pgPool
		.query(query, [name, email, password])
		.then((resp) => res.status(201).json({ msg: 'Success' }))
		.catch((err) => {
			res.status(400).json(err.detail);
		});
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
