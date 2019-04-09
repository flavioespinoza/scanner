// NODE_ENV
const dotenv = require('dotenv')
dotenv.load()

const Koa = require('koa')
const mongoose = require('mongoose')
const logger = require('koa-logger')
const cors = require('kcors')
const bodyParser = require('koa-bodyparser')
const routes = require('./routes/routes')
const config = require('./config')

const socket_events = require('./socket_events')

const _ = require('lodash')

const _log = require('./utils')._log

mongoose.Promise = global.Promise

mongoose.connect(config.database.url, config.database.opts)

const app = new Koa()

app.use(cors())
app.use(logger())
app.use(bodyParser())
app.use(routes)

const server = app.listen(config.server.port, () => _log.blue(`Index.js listening on port ${config.server.port}`))

const io = require('socket.io').listen(server)

socket_events(io)