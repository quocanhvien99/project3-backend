const logout = document.getElementById('logout');
logout.addEventListener('click', () => {
	axios({
		method: 'get',
		url: 'http://localhost:3000/user/logout',
		withCredentials: true,
	}).then((res) => {
		console.log(res.data.msg);
		localStorage.removeItem('isLogin');
		window.location.replace('/login.html');
	});
});

const navbar = document.querySelector('.side-bar');
const backBtn = document.querySelector('.back');
const openNavBar = document.querySelector('.open-nav');
backBtn.addEventListener('click', () => {
	navbar.classList.toggle('open');
});
openNavBar.addEventListener('click', () => {
	navbar.classList.toggle('open');
});
