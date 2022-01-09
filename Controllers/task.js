const pgPool = require('../Utils/pgPool');

exports.createTask = async (req, res) => {
	const { heading, description, start_time, end_time, email, projectId } =
		req.body;

	//get userid của ng chỉ định tạm ở đây về sau chuyển về phía client
	let query = 'select id from "user" where email=$1';
	let userId = await pgPool.query(query, [email]);
	userId = userId.rows[0].id;

	//Check tồn tại của project và quyền sở hữu
	query = 'select id from "project" where id=$1 and owner_id=$2';
	pgPool
		.query(query, [projectId, req.session.uid])
		.then((resp) => {
			if (resp.rowCount == 0) return res.status(400).json({ msg: 'Error' });

			//Add task
			query =
				'insert into "task"(user_id, project_id, heading, description, start_time, end_time) values ($1, $2, $3, $4, $5, $6)';
			pgPool
				.query(query, [
					userId,
					projectId,
					heading,
					description,
					start_time,
					end_time,
				])
				.then((resp) => res.status(201).json({ msg: 'Success' }))
				.catch((err) => res.status(400).json(err.detail));
		})
		.catch((err) => res.status(400).json(err.detail));
};

exports.getListTask = (req, res) => {
	let { limit, skip, pid, search, sortcol, sortby } = req.query;
	if (!sortcol) sortcol = 'start_time';
	if (!sortby) sortby = 'ASC';

	//get theo project
	if (pid) {
		const query = `select T.id as id, owner_id, name, heading, start_time, end_time, completed from "task" T, "project" P, "user" U where  project_id = $1 and T.project_id = P.id and T.user_id = U.id and (P.owner_id = $2 or P.visible_all = $3) ${
			search
				? "and (heading like '%" +
				  search +
				  "%' or description like '%" +
				  search +
				  "%') "
				: ''
		}order by ${sortcol} ${sortby} limit $4 offset $5`;
		pgPool
			.query(query, [pid, req.session.uid, true, limit, skip])
			.then((resp) => {
				if (resp.rows.length == 0)
					return res.json({
						data: [],
						count: 0,
					});

				pgPool
					.query(
						`select count(*) from "task" T, "project" P where project_id = $1 and T.project_id = P.id and (P.owner_id = $2 or P.visible_all = $3)${
							search
								? " and (heading like '%" +
								  search +
								  "%' or description like '%" +
								  search +
								  "%')"
								: ''
						}`,
						[pid, req.session.uid, true]
					)
					.then((resp1) => {
						const owner_id = resp.rows[0].owner_id;
						let isOwner;
						if (owner_id == req.session.uid) isOwner = true;
						else isOwner = false;
						return res.json({
							data: resp.rows,
							count: resp1.rows[0].count,
							owner: isOwner,
						});
					});
			})
			.catch((err) => {
				console.log(err);
				return res.status(400).json(err.detail);
			});
	} else {
		//get những task của bản thân
		const query =
			'select heading, start_time, end_time, completed, P.title as pname, T.id from "task" T, "project" P where T.project_id=P.id and user_id = $1 order by end_time ASC limit $2 offset $3';
		pgPool
			.query(query, [req.session.uid, limit, skip])
			.then((resp) => {
				pgPool
					.query('select count(*) from "task" where user_id = $1', [
						req.session.uid,
					])
					.then((resp1) => {
						return res.json({ data: resp.rows, count: resp1.rows[0].count });
					});
			})
			.catch((err) => {
				console.log(err);
				return res.status(400).json(err.detail);
			});
	}
};

exports.viewTask = (req, res) => {
	const query =
		'select T.id as id, user_id, heading, description, start_time, end_time, completed from "task" T, "project" P where (user_id = $1 or owner_id = $1 or visible_all=$2) and T.id=$3';
	pgPool
		.query(query, [req.session.uid, true, req.params.id])
		.then((resp) => {
			let data = resp.rows[0];
			if (data.user_id == req.session.uid) {
				data.owner = true;
			} else {
				data.owner = false;
			}

			res.json(data);
		})
		.catch((err) => {
			console.log(err);
			res.status(400).json(err.detail);
		});
};

exports.deleteTask = (req, res) => {
	let query =
		'select T.id as id from "task" T, "project" P where T.project_id = P.id and T.id=$1 and owner_id=$2';
	pgPool
		.query(query, [req.body.id, req.session.uid])
		.then((resp) => {
			console.log(resp.rows);
			query = 'delete from "task" where id=$1';
			pgPool.query(query, [resp.rows[0].id]).then(() => res.json('Success'));
		})
		.catch((err) => {
			console.log(err);
			res.status(400).json(err.detail);
		});
};

exports.updateTask = (req, res) => {
	const { id, completed } = req.body;
	let query = `update "task" set completed=$1 where id=$2 and user_id=$3`;
	let params = [completed, id, req.session.uid];
	pgPool
		.query(query, params)
		.then((resp) => res.json('Success'))
		.catch((err) => {
			console.log(err);
			res.status(400).json(err.detail);
		});
};
