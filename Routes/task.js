const router = require('express').Router();
const taskController = require('../Controllers/task');
const protectedRoute = require('../Middleware/protectedRoute');

router
	.route('/')
	.get(protectedRoute, taskController.getListTask)
	.post(protectedRoute, taskController.createTask)
	.put(protectedRoute, taskController.updateTask)
	.delete(protectedRoute, taskController.deleteTask);

router.route('/:id').get(taskController.viewTask);

module.exports = router;
