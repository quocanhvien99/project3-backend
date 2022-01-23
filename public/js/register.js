const loginForm = document.getElementById('login');
const fullname = document.getElementById('name');
const email = document.getElementById('email');
const password = document.getElementById('password');
const repassword = document.getElementById('confirm-password');
loginForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	const data = {
		email: email.value,
		password: password.value,
		name: fullname.value,
	};
	if (password.value !== repassword.value)
		return alert('Mật khẩu xác nhận không trùng');

	const res = await fetch('http://localhost:3000/user/register', {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		headers: {
			'Content-Type': 'application/json',
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: JSON.stringify(data), // body data type must match "Content-Type" header
	});
	if (res.status === 200) return location.replace('/login.html');
	const resData = await res.text();
	alert(resData);
});
