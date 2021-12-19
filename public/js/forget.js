let stage1 = document.querySelector('.stage1');
let stage2 = document.querySelector('.stage2');
let email = document.querySelector('#email');
let password = document.querySelector('#password');
let repassword = document.querySelector('#repassword');
let sendcode = document.querySelector('#sendcode');
let resetpass = document.querySelector('#resetpass');
let alertBox = document.querySelector('.alert');

stage1.addEventListener('submit', (event) => {
	event.preventDefault();
	const data = { email: email.value };
	axios({
		method: 'post',
		url: 'http://localhost:3000/user/forget',
		data,
		headers: {
			'Content-Type': 'application/json',
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
	stage1.classList.toggle('hide');
	stage2.classList.toggle('hide');
});
stage2.addEventListener('submit', (event) => {
	event.preventDefault();
	if (password.value !== repassword.value) {
		alertBox.innerHTMl = 'Mật khẩu không trùng khớp';
		return;
	}
	const data = {
		email: email.value,
		password: password.value,
		code: code.value,
	};
	axios({
		method: 'post',
		url: 'http://localhost:3000/user/reset',
		data,
		headers: {
			'Content-Type': 'application/json',
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
	}).then((res) => {
		if (res.status == 200) {
			alert('Đổi mật khẩu thành công');
			return (location.href = '/login.html');
		}
		alertBox.innerHTMl = 'Sai mã xác nhận';
	});
});
