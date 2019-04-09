const Router = require('koa-router')
const authControllers = require('../controllers/auth')

const {
	jwtAuth,
	login,
	register,
	forgotPassword,
	resetPassword,
	getAll,
	getAuthenticatedUser
} = authControllers

const router = new Router({prefix: '/auth'})

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:resetToken', resetPassword)
router.post('/all', getAll)

router.get('/generate_guid', jwtAuth, getAuthenticatedUser)
router.get('/list_simple', jwtAuth, getAuthenticatedUser)
router.get('/list_compound', jwtAuth, getAuthenticatedUser)

module.exports = router
