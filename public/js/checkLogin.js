export default () => {
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
};
