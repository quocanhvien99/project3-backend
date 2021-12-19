const router = require('express').Router();
const userController = require('../Controllers/user');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.post('/forget', userController.forgetPassword);
router.post('/reset', userController.resetPassword);

module.exports = router;
