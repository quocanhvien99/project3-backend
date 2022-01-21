const pgPool = require('../Utils/pgPool');

exports.createProject = (req, res) => {
	const { title, visible_all } = req.body;
	const query =
		'insert into "project"(owner_id, title, visible_all) values ($1, $2, $3)';
	pgPool
		.query(query, [req.session.uid, title, visible_all])
		.then((resp) => res.status(201).json({ msg: 'Success' }))
		.catch((err) => res.status(400).json(err.detail));
};

exports.getListProject = (req, res) => {
	const { limit, skip } = req.query;
	const query =
		'select * from "project" where "project".owner_id = $1 order by create_at DESC limit $2 offset $3';
	pgPool
		.query(query, [req.session.uid, limit, skip])
		.then((resp) => {
			pgPool
				.query('select count(*) from "project" where owner_id = $1', [
					req.session.uid,
				])
				.then((resp1) => {
					res.json({ data: resp.rows, count: resp1.rows[0].count });
				});
		})
		.catch((err) => res.status(400).json(err.detail));
};

exports.updateProject = (req, res) => {
	const { id, title, visible_all } = req.body;
	let query = `update "project" set title=$1, visible_all=$2 where id=$3 and owner_id=$4`;
	let params = [title, visible_all, id, req.session.uid];
	pgPool
		.query(query, params)
		.then((resp) => res.json('Success'))
		.catch((err) => res.status(400).json(err.detail));
};

exports.viewProject = (req, res) => {
	const query =
		'select * from "project" where "project".owner_id = $1 and id=$2';
	pgPool
		.query(query, [req.session.uid, req.params.id])
		.then((resp) => res.json(resp.rows))
		.catch((err) => res.status(400).json(err.detail));
};

exports.deleteProject = (req, res) => {
	let query = 'delete from "task" where project_id=$1';
	pgPool
		.query(query, [req.body.id])
		.then(() => {
			query = 'delete from "project" where id=$1 and owner_id=$2';
			pgPool
				.query(query, [req.body.id, req.session.uid])
				.then(() => res.json('Success'))
				.catch((err) => res.status(400).json(err.detail));
		})
		.catch((err) => res.status(400).json(err.detail));
};
