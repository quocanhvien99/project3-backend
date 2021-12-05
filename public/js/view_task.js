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
const taskId = query.get('id');

axios({
	method: 'get',
	url: `http://localhost:3000/task/${taskId}`,
	withCredentials: true,
}).then((res) => {
	const data = res.data;
	const task = document.querySelector('.task-info');

	let start = new Date(data.start_time);
	let end = new Date(data.end_time);
	start = `${start.getDate()}/${start.getMonth() + 1}/${start.getFullYear()}`;
	end = `${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;

	task.innerHTML = `
    <div class="task-info">
        <p><span>Tiêu đề:</span> ${data.heading}</p>
        <p><span>Thời gian bắt đầu:</span> ${start}</p>
        <p><span>Thời gian kết thúc:</span> ${end}</p>
        <span>Mô tả:</span>
        <p>${data.description}</p>
        <p><span>Trạng thái:</span> ${
					data.completed ? 'Hoàn thành' : 'Chưa hoàn thành'
				}</p>
        ${
					data.owner && !data.completed
						? `<button onClick="complete(${data.id})">Hoàn thành</button>`
						: ''
				}
    </div>  
    `;
});

function complete(tid) {
	axios({
		method: 'PUT',
		url: 'http://localhost:3000/task',
		data: { id: tid, completed: true },
		headers: {
			'Content-Type': 'application/json',
		},
		withCredentials: true,
	}).then((res) => {
		window.alert(res.data);
		window.location.reload();
	});
}
