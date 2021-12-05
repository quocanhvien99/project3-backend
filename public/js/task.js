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

let limit = 12;
let skip = 0;
let totalTask;
const list = document.querySelector('.list');

function loadTask(firstRun = false) {
	if (totalTask && totalTask == skip) return;

	let preload = '';
	for (let i = 0; i < limit; i++) {
		preload += `<li class="item loading"><div class="circle"></div></li>`;
	}
	list.innerHTML += preload;

	axios({
		method: 'get',
		url: `http://localhost:3000/task?limit=${
			firstRun ? 28 : limit
		}&skip=${skip}`,
		withCredentials: true,
	}).then((res) => {
		console.log(res.data);
		document.querySelectorAll('.item.loading').forEach((x) => x.remove());

		if (firstRun) totalTask = res.data.count;
		skip = skip + res.data.data.length;

		let html = [];
		res.data.data.map((x) => {
			let state;
			const startTime = new Date(x.start_time);
			let endTime = new Date(x.end_time);
			endTime = `${endTime.getDate()}/${
				endTime.getMonth() + 1
			}/${endTime.getFullYear()}`;

			if (Date.now() < startTime) state = 'purple';
			else if (x.completed) state = 'green';
			else state = 'red';
			html.push(`
            <li class="item ${state}" onClick="view(${x.id})">
                            <p><span>Tiêu đề: </span>${x.heading}</p>
                            <p><span>Thời hạn: </span>${endTime}</p>
                            <p><span>Dự án: </span>${x.pname}</p>
                        </li>
            `);
		});

		html = html.join('');
		list.innerHTML = list.innerHTML + html;
		infiteLoad(list.lastElementChild);
	});
}

function infiteLoad(target) {
	const io = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				loadTask();
				observer.disconnect();
			}
		});
	});

	io.observe(target);
}

function view(tid) {
	window.location.href = '/view_task.html?id=' + tid;
}

//chạy lần đầu
loadTask(true);
