const Router = require('koa-router')
const authControllers = require('../controllers/auth')
const chatControllers = require('../controllers/chat')

const {
	jwtAuth
} = authControllers

const {
	getConversations,
	getConversation,
	newConversation,
	sendReply
} = chatControllers

const router = new Router({prefix: '/chat'})

router.get('/', jwtAuth, getConversations)
router.get('/:conversationId', jwtAuth, getConversation)
router.post('/:conversationId', jwtAuth, sendReply)
router.post('/new/:recipient', jwtAuth, newConversation)

module.exports = router