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

let table = document.getElementsByTagName('table')[0];
let pagination = document.getElementsByClassName('pagination')[0];

let query = window.location.search;
query = new URLSearchParams(query);
let totalPage;
let curPage = query.get('page') || 1;
let limit = 5;

async function updateTable(curPage) {
	const skip = (curPage - 1) * limit;
	let res = await axios({
		method: 'get',
		url: `http://localhost:3000/project?limit=${limit}&skip=${skip}`,
		withCredentials: true,
	});

	let html = res.data.data.map((x) => {
		let time = new Date(x.create_at);
		time = `${time.getDate()}/${time.getMonth() + 1}/${time.getFullYear()}`;
		return `<tr><td>${x.id}</td><td>${x.title}</td><td>${time}</td><td>
					<button id="view" onClick="view(${x.id})">Xem</button>
					<button id="delete" onClick="del(${x.id})">Xoá</button>
			</td></tr>`;
	});
	html = html.join('');
	let tableHeader =
		'<tr><th>#</th><th>Thông tin</th><th>Ngày tạo</th><th>Hành động</th></tr>';
	html = tableHeader.concat(html);
	table.innerHTML = html;
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
			} href="${curUrl}?page=${i}">${i}</a></li>`
		);
	}
	html = html.join('');
	html =
		`<li><a href="${curUrl}?page=${
			page == 1 ? 1 : page - 1
		}"><span class="material-icons-outlined"> navigate_before </span></a></li>` +
		html +
		`<li><a href="${curUrl}?page=${
			page == totalPage ? page : parseInt(page) + 1
		}"><span class="material-icons-outlined"> navigate_next </span></a></li>`;
	pagination.innerHTML = html;
}

function view(pid) {
	window.location.href = '/view_project.html?id=' + pid;
}
function del(pid) {
	let confirm = window.confirm('Xác nhận xoá project?');
	if (confirm) {
		axios({
			method: 'delete',
			url: 'http://localhost:3000/project',
			data: { id: pid },
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

const createbtn = document.getElementById('create');
createbtn.addEventListener('click', () => {
	popup.classList.toggle('open');
});

const confirmBtn = document.getElementById('confirm');
confirmBtn.addEventListener('click', (e) => {
	e.preventDefault();
	const title = document.getElementById('title');
	const visible = document.getElementById('visible_all');
	axios({
		method: 'post',
		url: 'http://localhost:3000/project',
		data: { title: title.value, visible_all: visible.checked },
		headers: {
			'Content-Type': 'application/json',
		},
		withCredentials: true,
	}).then((res) => {
		popup.classList.toggle('open');
		updatePagination(curPage);
	});
});
