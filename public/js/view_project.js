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
	console.log(data);
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
