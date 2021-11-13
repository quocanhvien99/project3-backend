const router = require('express').Router();
const projectController = require('../Controllers/project');
const protectedRoute = require('../Middleware/protectedRoute');

router
	.route('/')
	.get(protectedRoute, projectController.getListProject)
	.post(protectedRoute, projectController.createProject)
	.put(protectedRoute, projectController.updateProject)
	.delete(protectedRoute, projectController.deleteProject);

router.route('/:id').get(projectController.viewProject);

module.exports = router;
