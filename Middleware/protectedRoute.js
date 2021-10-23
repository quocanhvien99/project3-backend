module.exports = (req, res, next) => {
	if (req.session.uid) return next();
	res.status(401).json({ msg: 'Cần đăng nhập' });
};
