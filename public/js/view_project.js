//Kiểm tra đăng nhập
const login = JSON.parse(localStorage.getItem('isLogin'));
if (!login || login.exp < Date.now()) {
	localStorage.removeItem('isLogin');
	location.replace('/login.html');
} else {
	//Tăng ttl của isLogin
	localStorage.setItem(
		'isLogin',
		JSON.stringify({ ...login, exp: Date.now() + 30 * 60 * 1000 })
	);
}

let query = window.location.search;
query = new URLSearchParams(query);
const projectId = query.get('id');

const title = document.getElementById('title');
const visible = document.getElementById('visible_all');

axios({
	method: 'get',
	url: `http://localhost:3000/project/${projectId}`,
	withCredentials: true,
}).then((res) => {
	const data = res.data[0];
	title.value = data.title;
	visible.checked = data.visible_all;
});

const updateBtn = document.getElementById('update');
updateBtn.addEventListener('click', (e) => {
	e.preventDefault();
	const data = {
		id: projectId,
		title: title.value,
		visible_all: visible.checked,
	};
	axios({
		method: 'PUT',
		url: 'http://localhost:3000/project',
		data: data,
		headers: {
			'Content-Type': 'application/json',
		},
		withCredentials: true,
	}).then((res) => window.alert(res.data));
});

const toggleTaskForm = document.querySelector('#create');
const addTaskForm = document.querySelector('#add-task');
toggleTaskForm.addEventListener('click', (e) => {
	addTaskForm.classList.toggle('show');
});
addTaskForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const formData = new FormData(e.target);
	const data = {
		heading: formData.get('heading'),
		description: formData.get('description'),
		start_time: formData.get('start_time'),
		end_time: formData.get('end_time'),
		email: formData.get('email'),
		projectId,
	};
	axios({
		method: 'POST',
		url: 'http://localhost:3000/task',
		data: data,
		headers: {
			'Content-Type': 'application/json',
		},
		withCredentials: true,
	}).then((res) => window.alert(res.data));
});

//table và pagination
let totalPage;
let curPage = query.get('page') || 1;
let limit = 5;

let table = document.getElementsByTagName('table')[0];
let pagination = document.getElementsByClassName('pagination')[0];

async function updateTable(curPage) {
	const skip = (curPage - 1) * limit;
	let res = await axios({
		method: 'get',
		url: `http://localhost:3000/task?pid=${projectId}&limit=${limit}&skip=${skip}`,
		withCredentials: true,
	});
	const isOwner = res.data.owner;
	let html = res.data.data.map((x) => {
		let start = new Date(x.start_time);
		let end = new Date(x.end_time);
		start = `${start.getDate()}/${start.getMonth() + 1}/${start.getFullYear()}`;
		end = `${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
		return `<tr><td>${x.name}</td><td>${x.heading}</td><td>${
			x.finished ? 'Hoàn thành' : 'Chưa hoàn thành'
		}</td>
		<td>${start}</td><td>${end}</td>
		<td>
					<button class="btn" id="view" onClick="view(${x.id})">Xem</button>
					${
						isOwner
							? `<button class="btn" id="delete" onClick="del(${x.id})">Xoá</button>`
							: ''
					}
			</td></tr>`;
	});
	html = html.join('');
	let tableHeader =
		'<tr><th>Người thực hiện</th><th>Thông tin</th><th>Trạng thái</th><th>Ngày bắt đầu</th><th>Ngày kết thúc</th><th>Hành động</th></tr>';
	html = tableHeader.concat(html);
	table.innerHTML = table.innerHTML + html;
	return res.data.count;
}

async function updatePagination(page) {
	const totalProj = await updateTable(page);
	const totalPage = Math.ceil(totalProj / limit);

	let curUrl = window.location.origin + window.location.pathname;

	let html = [];
	for (let i = 1; i <= totalPage; i++) {
		html.push(
			`<li><a ${
				i == page ? 'class="selected"' : ''
			} href="${curUrl}?id=${projectId}&page=${i}">${i}</a></li>`
		);
	}
	html = html.join('');
	html =
		`<li><a href="${curUrl}?id=${projectId}&page=${
			page == 1 ? 1 : page - 1
		}"><span class="material-icons-outlined"> navigate_before </span></a></li>` +
		html +
		`<li><a href="${curUrl}?id=${projectId}&page=${
			page == totalPage ? page : parseInt(page) + 1
		}"><span class="material-icons-outlined"> navigate_next </span></a></li>`;
	pagination.innerHTML = html;
}

function view(tid) {
	window.location.href = '/view_task.html?id=' + tid;
}
function del(tid) {
	let confirm = window.confirm('Xác nhận xoá project?');
	console.log(tid);
	if (confirm) {
		axios({
			method: 'delete',
			url: 'http://localhost:3000/task',
			data: { id: tid },
			headers: {
				'Content-Type': 'application/json',
			},
			withCredentials: true,
		}).then((res) => {
			window.alert(res.data);
			window.location.reload();
		});
	}
}

updatePagination(curPage); //Chay khi load lan dau
